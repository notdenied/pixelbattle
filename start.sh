cd backend
screen -S pbback -dm python3 -m uvicorn server:app --host 0.0.0.0 --reload
cd ../frontend
npm i
npm run build
cd dist
screen -S pbfront -dm npx serve -n -l 1234
cd ../../
