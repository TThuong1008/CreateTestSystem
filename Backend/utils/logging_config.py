import logging
import sys
from typing import Optional

def setup_logging(name: Optional[str] = None, level: str = 'INFO') -> logging.Logger:
    """
    Set up and configure logging for the application
    
    Args:
        name (str, optional): Name of the logger. Defaults to None.
        level (str, optional): Logging level. Defaults to 'INFO'.
    
    Returns:
        logging.Logger: Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name or __name__)
    
    # Set logging level
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.setLevel(log_level)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    # Add handler to logger (if not already added)
    if not logger.handlers:
        logger.addHandler(console_handler)
    
    return logger