# ML Service Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY ml ./
EXPOSE 5001
CMD ["python", "predict_service.py"]
