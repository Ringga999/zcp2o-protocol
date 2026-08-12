# Gunakan Python 3.9 slim untuk ukuran image yang kecil
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy folder zcp2o-core dari parent directory
COPY zcp2o-core /app/zcp2o-core

# Copy semua file dari zcp2o-node
COPY zcp2o-node /app/zcp2o-node

# Pindah ke folder node
WORKDIR /app/zcp2o-node

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port untuk FastAPI
EXPOSE 8000

# Jalankan server Uvicorn
# --host 0.0.0.0 penting agar bisa diakses dari luar container
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]