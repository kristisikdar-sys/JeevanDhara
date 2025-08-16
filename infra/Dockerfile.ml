FROM python:3.11-slim

WORKDIR /app

COPY ml/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ml/ ./

EXPOSE 5000
CMD ["python", "predict_service.py"]