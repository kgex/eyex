## to run google classroom python codes

```sh
pip install --upgrade google-api-python-client
pip install google-auth-oauthlib
```


1. List Courses from Google Classroom

```
python listcourses.py

## output
Courses:
Name: AIES-Batch-1, ID: 660191923617
Name: Coursera:Demo, ID: 697771245190
Name: Cloud & Devops, ID: 696505254490
Name: Web3, ID: 696505288153

```

2. List Students from Google Classroom using Course Id

```py
python liststudents.py

## output is stored in liststudents.json
```

## Flow

1. Assign a new content under coursera InnovationLabsKITE
2. fetchCourseraPrograms function will be called and coursera courses will be auto added to GC. 
3. update courseraProgramId (find coursera learning path id using postman) and Google classroom id (find id using listcourses.py)
4. Coursera-Final-Fetch - fetch_post_courses_coursera_gc.gc 