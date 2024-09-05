cd backend
screen -S pbback -dm python3 -m uvicorn server:app --host 0.0.0.0 --workers 1 --reload # >1 workers -> death
cd ../frontend
npm i
npm run prod_build
cd dist
screen -S pbfront -dm npx serve -n -l 1234 # todo: use production server instead
cd ../../
