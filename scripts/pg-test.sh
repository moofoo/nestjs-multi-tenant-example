#!/bin/bash

psql postgresql://tenant:c7b38884e5c959ac151e4f24320c7a34@localhost:5432/app_db -c "select * from fn.tenancy_select_$1($2, '$3')"