FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN python -m pip install --break-system-packages flask flask-sqlalchemy psycopg2-binary werkzeug

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
