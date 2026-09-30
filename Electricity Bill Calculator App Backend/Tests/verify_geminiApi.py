import asyncio
import mimetypes
from pathlib import Path
import json

from Configuration.gemini_client import extract_from_image

prompt = """
You are an electricity bill data extraction system. You have received an electricity bill image.
Analyze the uploaded electricity bill image and extract the required information.

## Required Information

Extract ALL of the following:

1. `consumerName`
   - Type: string
   - Extract the consumer's name exactly as written on the bill.

2. `currentBillDetails`: Current Bill Details must contain information about the current month's electricity bill shown in the provided image. The received image represents the current month's bill issued by the electricity provider.
   - Type: object, and it contains month , units and electricity bill of current month
     - `month`: string in `MMM YYYY` format, such as `Aug 2026`
     - `units`: integer representing electricity units consumed during that month
     - `bill`: integer representing the bill amount for that month

3. `readingDate`
   - Type: integer
   - Extract ONLY the day/date number on which the meter reading was taken.
   - Do not return the month or year.
   - Example: If the reading date is `14-Aug-2026`, return `14`.

4. `unitsPresentReading`
   - Type: integer
   - Extract the current/present meter reading from the bill.
   - Do not return the electricity units consumed for the month.
   - This must be the meter's PRESENT READING value.
   - Example: If the bill shows `Present Reading: 7114`, return `7114`.

5. `previousReadings`
   - Type: array of objects.
   - This array must contain the previous 12 months' records.
   - Each object must contain:
     - `month`: string in `MMM YYYY` format, such as `Aug 2026`
     - `units`: integer representing electricity units consumed during that month
     - `bill`: integer representing the bill amount for that month

## Required Output

If ALL required information is successfully extracted and verified from the bill, return ONLY this type of JSON object:
Let's suppose the current Month whose image you have received is "Aug 2026", then the JSON looks like this

{
  "success": true,
  "message": "Data Fetched from Bill",
  "consumerName": "TANVEER AHMAD\nFATEH ALI\nKOT PEHPRA\nP.D.KHAN",
  "currentBillDetails": {
    "month": "Aug 2026",
    "units": 45,
    "bill": 1192
  },
  "readingDate": 14,
  "unitsPresentReading": 7834,
  "previousReadings": [
    {
      "month": "Jul 2026",
      "units": 66,
      "bill": 1417
    },
    {
      "month": "Jun 2026",
      "units": 25,
      "bill": 739
    },
    {
      "month": "May 2026",
      "units": 18,
      "bill": 708
    },
    {
      "month": "Apr 2026",
      "units": 23,
      "bill": 873
    },
    {
      "month": "Mar 2026",
      "units": 20,
      "bill": 1072
    },
    {
      "month": "Feb 2026",
      "units": 65,
      "bill": 922
    },
    {
      "month": "Jan 2026",
      "units": 48,
      "bill": 649
    },
    {
      "month": "Dec 2025",
      "units": 10,
      "bill": 90
    },
    {
      "month": "Nov 2025",
      "units": 19,
      "bill": 240
    },
    {
      "month": "Oct 2025",
      "units": 52,
      "bill": 14
    },
    {
      "month": "Sep 2025",
      "units": 25,
      "bill": 271
    },
    {
      "month": "Aug 2025",
      "units": 50,
      "bill": 555
    }
  ]
}

The `previousReadings` array must contain previous 12 months, month , units and bill record, if that information is available on the bill.

## Invalid Bill Rule

Return the invalid bill JSON object if ANY of the following conditions or any other error occurs:

- The image is blurry.
- The text is unreadable.
- The uploaded image is not an electricity bill.
- The wrong document/image was uploaded.
- One or more required fields cannot be identified reliably.
- The consumer name cannot be identified reliably.
- The current bill units , bill ,month and year cannot be identified reliably.
- The reading date cannot be identified reliably.
- The present meter readings cannot be identified reliably.
- The current month's units or bill cannot be identified reliably.
- Any required previous-month units or bill information cannot be identified reliably.
- The bill does not contain enough information to construct the required `previousReadings` data.
- Any extracted value is ambiguous or uncertain.
- The information required to produce the specified JSON structure cannot be reliably extracted.

For ANY invalid case, return ONLY:

{
  "message": "Invalid Bill",
  "success": false
}

## Accuracy Rules

Important note about previous record : In ,previousReadings', include information for the previous 12 months only, ordered in reverse chronological order. The month immediately preceding the current bill month must be at index 0. For example, if the current bill month is "Aug 2026", index 0 must contain "Jul 2026", index 1 must contain "Jun 2026", and so on, continuing backward month by month until all 12 previous months are included.

- Do not guess, estimate, infer, or invent missing values.
- Do not use information that is not visible or reliably readable in the image.
- Carefully distinguish `Present Reading` from `Units Consumed`.
- `unitsPresentReading` must contain the meter's present reading, not the monthly consumption.
- `units` inside `previousReadings` must contain the monthly electricity consumption.
- `bill` inside `previousReadings` must contain the corresponding monthly bill amount.
- Preserve the actual values from the bill.
- Convert numeric values to integers where required.
- `currentBillDetails` must contain only the current month units , bill and month in object format.
- `readingDate` must contain only the day number.
- Format every `month` in `previousReadings` as `MMM YYYY`.
- Do not include currency symbols in `bill`.
- Do not include units such as `kWh` in `units`.
- Do not include commas or other formatting characters inside numeric values.
- Do not return partial data.
- If the required information cannot be completely and reliably extracted, return the `Invalid Bill` JSON.

## Output Restriction

Return ONLY a valid JSON object.

Do not return:
- Markdown
- Code fences
- Explanations
- Comments
- Additional text
- Analysis
- Confidence scores
- Any fields other than the fields specified above

The response must always be exactly one of the two JSON response types defined above: return the success JSON with all required data when all required information is extracted reliably; otherwise, return the invalid bill JSON with `"success": false`.

If the uploaded image is not an electricity bill or does not appear to be an electricity bill, return the "Invalid Bill" JSON object.

Note: Response must be JSON in any case. The response must start with `{` and end with `}`.

The JSON must be valid and directly parseable by a backend application.
"""
IMAGE_PATH = "Faisalabad.jpg"

async def main():
    path = Path(IMAGE_PATH)

    # detect mime type from file extension
    mime_type, _ = mimetypes.guess_type(path.name)
    mime_type = mime_type or "image/jpeg"

    # read image bytes
    with open(path, "rb") as f:
        image_bytes = f.read()

    print(f"Image:     {path}")
    print(f"MIME type: {mime_type}")
    print(f"Size:      {len(image_bytes)} bytes")
    print("Sending to Gemini...\n")

    # call the async helper
    raw = await extract_from_image(
        image_bytes=image_bytes,
        prompt=prompt,
        mime_type=mime_type,
    )

    print("─" * 60)
    print("GEMINI RESPONSE :")
    print("─" * 60)
    print(raw)
    print("─" * 60)

    data = json.loads(raw)
    print(data)
    print(type(data))

if __name__ == "__main__":
    asyncio.run(main())