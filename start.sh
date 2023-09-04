if [ ! -d .venv ]
then
    usr/bin/python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
