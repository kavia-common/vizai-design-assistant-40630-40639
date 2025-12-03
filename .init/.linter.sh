#!/bin/bash
cd /home/kavia/workspace/code-generation/vizai-design-assistant-40630-40639/ui_enhancement_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

