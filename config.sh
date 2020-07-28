#!/usr/bin/env bash

cat <<EOS > src/aws-config.ts
export const DATA_BUCKET_NAME = "${DATA_BUCKET_NAME}";
export const IDENTITY_POOL_ID = "${IDENTITY_POOL_ID}";
export const AWS_REGION = "us-east-1";
EOT
