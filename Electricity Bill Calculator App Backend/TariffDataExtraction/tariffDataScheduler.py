from apscheduler.schedulers.asyncio import AsyncIOScheduler
from TariffDataExtraction.extractTariffData import extractTariffRates

scheduler = AsyncIOScheduler(timezone="Asia/Karachi")
async def runTariffRefresh():
    
    try:
        print("🔄 Scheduled, Tariff Data Extraction Refresh Starting...")
        await extractTariffRates()
        print("✅ Scheduled, Tariff Data Extraction Refresh Finished.")
    except Exception as e:
        print(f"❌ Scheduled tariff refresh failed: {e}")


def registerJobs():

    scheduler.add_job(
        runTariffRefresh,
        trigger="cron",
        hour=19,
        minute=14,
        id="tariffRefresh",
        replace_existing=True,
        misfire_grace_time=3600,   # tolerate up to 1h delay
    )
    print("📅 Tariff refresh scheduled for 03:00 AM daily (Asia/Karachi)")