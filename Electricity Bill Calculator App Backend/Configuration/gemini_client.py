from google import genai
from google.genai import types

from Configuration.config import settings

client = genai.Client(api_key=settings.gemini_api_key)


async def extract_from_image(
    image_bytes: bytes,
    prompt: str,
    mime_type: str = "image/jpeg",
) -> str:
    print("Model -> ",settings.gemini_model)
    
    try:
        response = await client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                prompt,
            ],
        )
    except Exception as e:
        raise RuntimeError(f"Gemini API request failed: {e}") from e

    return response.text or ""


async def extract_from_html(
    prompt:str,
    html: str,
) -> str:
    
    try:
        response = await client.aio.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt, html],
        )
    except Exception as e:
        raise RuntimeError(f"Gemini API request failed: {e}") from e

    return response.text or ""