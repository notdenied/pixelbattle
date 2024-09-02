cd backend
screen -S pbback -dm python3 -m uvicorn server:app --host 0.0.0.0 --reload
cd ../frontend
screen -S pbfront -dm "npm run build && cd dist && npx serve -n -l 1234"
cd ../
