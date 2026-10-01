
from google.cloud import firestore
from Configuration.gemini_client import extract_from_html
from Configuration.config import settings
from Configuration.firestore_client import get_db
from Utils.cleanHtml import cleanHTML
from Utils.fetchHtml import fetchHTML
from Utils.extractJson import extractJSON
from Prompts.tariffDataExtraction import TARIFF_DATA_EXTRACTION_PROMPT

URL = settings.tariff_data_extraction_url

async def extractTariffRates():
    try:
        rawHtml = await fetchHTML(URL, 40.0)
        cleaned = cleanHTML(rawHtml)
        rawRes = await extract_from_html(TARIFF_DATA_EXTRACTION_PROMPT, cleaned)
        tariffData = extractJSON(rawRes)

        if not tariffData.get("success"):
            print(tariffData)
            return

        tariffData["updatedAt"] = firestore.SERVER_TIMESTAMP

        db = get_db()
        await db.collection("TariffRates").document(settings.tariff_data_document_id).update(tariffData)
        print("__Tariff Rates Data Updated to firestore__")

    except Exception as e:
        print("Error --> ", str(e))

