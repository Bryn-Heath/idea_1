from .logging_config import setup_logging, get_logger

setup_logging()

logger = get_logger(__name__)


async def log_request(request):
    try:
        body = await request.body()
        logger.info(
            f"{request.method} {request.url} - body: {body.decode('utf-8')}"
        )
    except Exception as e:
        logger.error(f"Error logging request: {e}")
