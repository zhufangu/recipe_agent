import json
import os
import re
from typing import List, Dict, Any, Optional, Union
from openai import OpenAI

# 导入 load_dotenv
from dotenv import load_dotenv

# 在所有代码之前执行它，这样.env文件里的变量就会被加载到环境中
load_dotenv()
