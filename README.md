# pixelbattle

Simple pixelbattle implementation.

Require some apt packages (mariadb, ???), I will add them here with more detailed guide later.

run backend server:
```
cd backend && python3 -m uvicorn server:app --host 0.0.0.0 [--reload]
```

backend settings:
```
vim config.json
```
(see required fields at `config.py` ¯\\_(ツ)_/¯)

run frontend server:
```
npm i
```
(install 100500 packages, once)
```
cd frontend && npm start
```
or
```
cd frontend && npm run build && cd dist && npx serve -n -l 1234
```

settings:
```
vim src/constants.js
```

run/stop everything (require to install npm packages at first time):
```
./start.sh
```
```
./stop.sh`
```
