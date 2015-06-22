import django
from django.http import HttpResponse
from django.shortcuts import render
import pandas
from triathlon.models import Participant, ParticipantTable
from django_tables2 import RequestConfig
import json
import datetime

def index(request):
    participants = Participant.objects.all()
    table = ParticipantTable(participants)
    RequestConfig(request, paginate=False).configure(table)
    context = {'table': table}
    return render(request, "triathlon/participants.html", context)

def plots(request):
    df = Participant.data_frame()
    df.time = df.time.map(convert_time_to_seconds)
    df = df[['name', 'position', 'time']]
    df = df[df.time != -1]
    output = df.T.to_dict().values()
    output = json.dumps(output)
    output = django.utils.safestring.mark_safe(output)
    participants = sorted(df['name'])
    print participants
    context = {'data': output, 'participants': participants}
    return render(request, "triathlon/plots.html", context)

def convert_time_to_seconds(time):
    try:
        output = datetime.datetime.strptime(time, '%H:%M:%S.%f') - datetime.datetime.strptime('00:', '%H:')
        output = output.seconds + output.microseconds * 1e-6
    except ValueError:
        output = -1
    return output

    
