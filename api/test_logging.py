import logging

# Test all log levels with different loggers
root_logger = logging.getLogger()
django_logger = logging.getLogger('django')
users_logger = logging.getLogger('users')

print("Testing root logger...")
root_logger.debug("ROOT DEBUG message")
root_logger.info("ROOT INFO message")
root_logger.warning("ROOT WARNING message")
root_logger.error("ROOT ERROR message")

print("\nTesting django logger...")
django_logger.debug("DJANGO DEBUG message")
django_logger.info("DJANGO INFO message")
django_logger.warning("DJANGO WARNING message")
django_logger.error("DJANGO ERROR message")

print("\nTesting users logger...")
users_logger.debug("USERS DEBUG message")
users_logger.info("USERS INFO message")
users_logger.warning("USERS WARNING message")
users_logger.error("USERS ERROR message")

print("\nLog test complete!")
