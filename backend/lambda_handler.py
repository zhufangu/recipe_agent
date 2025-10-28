"""
Lambda Handler - Adapts FastAPI application to AWS Lambda

This file uses Mangum to convert the FastAPI app to a Lambda-compatible handler.
Baseline version without performance optimizations.
"""

from mangum import Mangum
from main import app

# Use Mangum to convert FastAPI to Lambda handler
# lifespan="off" because Lambda has its own lifecycle management
handler = Mangum(app, lifespan="off")
