import os
from dotenv import load_dotenv
load_dotenv()

path = os.getenv("UTILS")

print(path)

def text_file(text:str,filename:str):
    text_file_path = os.path.join(path, f"{filename}.txt")
    with open(text_file_path, "w", encoding="utf-8") as f:
        f.write(text)