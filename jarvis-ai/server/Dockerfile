FROM python:3.11-slim

WORKDIR /app

COPY requirements-cloud.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY jarvis_cloud.py .

EXPOSE 8000

CMD ["python", "jarvis_cloud.py"]
