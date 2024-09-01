import os
import sys


# https://github.com/pixijs/pixijs/pull/10151

path = sys.argv[-1]

pattern1 = b'delete this.activeInteractionData[pointerId];'
pattern2 = b'delete this.activeInteractionData[pointerId]; if (interactionData.identifier === MOUSE_POINTER_ID) return;'

for path, dirs, files in os.walk(path):
    for file in files:
        with open(path + '/' + file, 'rb') as f:
            content = f.read()
        if pattern1 in content and pattern2 not in content:
            content = content.replace(pattern1, pattern2)
            with open(path + '/' + file, 'wb') as f:
                f.write(content)
                print(f'patch file {path} : {file}')
