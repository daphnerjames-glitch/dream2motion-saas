FROM python:3.11-slim

WORKDIR /workspace

COPY main.py requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

CMD exec functions-framework --target=process_income_engine_pipeline --port=${PORT:-8080}
