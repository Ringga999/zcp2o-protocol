"""
ZCP2O Node Logging Module.
Provides professional, dual-output (Console + File) logging with daily rotation.
"""

import logging
from logging.handlers import TimedRotatingFileHandler
import os

def get_logger(node_name: str, log_dir: str = "logs", log_level: str = "INFO") -> logging.Logger:
    """
    Creates and configures a logger for the Digital Bunker.
    
    Args:
        node_name (str): Name of the node (e.g., "CampusX_Bunker").
        log_dir (str): Directory to store log files.
        log_level (str): Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
    
    Returns:
        logging.Logger: Configured logger instance.
    """
    # Create logs directory if it doesn't exist
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Create a custom logger
    logger = logging.getLogger(f"zcp2o_node_{node_name}")
    
    # Prevent adding multiple handlers if logger already exists
    if logger.hasHandlers():
        logger.handlers.clear()

    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Define log format
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 1. Console Handler (For real-time terminal monitoring)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 2. File Handler (For audit trail and archiving)
    # Rotates every midnight, keeps 30 days of backup logs
    log_file_path = os.path.join(log_dir, f"{node_name}.log")
    file_handler = TimedRotatingFileHandler(
        filename=log_file_path,
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger