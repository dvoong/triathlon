import collections
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
    df.swim = df.swim.map(convert_run_to_seconds)
    df.t1 = df.t1.map(lambda x: convert_time_to_seconds(x, '%M:%S.%f'))
    df.cycle = df.cycle.map(convert_run_to_seconds)
    df.t2 = df.t2.map(lambda x: convert_time_to_seconds(x, '%M:%S.%f'))
    df.run = df.run.map(convert_run_to_seconds)
    df = df[['name', 'position', 'time', 'swim', 't1', 'cycle', 't2', 'run']]
    df = df[df.time != -1]
    df = df[df.swim != -1]
    df = df[df.t1 != -1]
    df = df[df.cycle != -1]
    df = df[df.t2 != -1]
    df = df[df.run != -1]
    output = df.T.to_dict().values()
    output = json.dumps(output)
    output = django.utils.safestring.mark_safe(output)
    participants = sorted(df['name'])
    table = ParticipantTable([], attrs={'id': 'detailed-table', 'class': 'paleblue'}, exclude=['id'])
    context = {'data': output, 'participants': participants, 'table': table}
    return render(request, "triathlon/plots.html", context)

def convert_run_to_seconds(time):
    output = convert_time_to_seconds(time)
    if output == -1:
        output = convert_time_to_seconds(time, '%M:%S.%f')
    return output

def convert_time_to_seconds(time, format='%H:%M:%S.%f'):
    try:
        output = datetime.datetime.strptime(time, format) - datetime.datetime.strptime('00:', '%H:')
        output = output.seconds + output.microseconds * 1e-6
    except ValueError:
        output = -1
    return output

def participant(request, participant):
    participant = Participant.objects.get(name=participant)
    table = ParticipantTable([participant], attrs={'id': 'detailed-table', 'class': 'paleblue'}, exclude=['id'])
    return HttpResponse(table.as_html())

def analysis(request, gender, category):
    df = Participant.data_frame()
    if gender != 'all':
        df = df[df["gender"] == {'male': 'M', 'female': 'F'}[gender]]
    if category != 'All': 
        df = df[df["category"] == category]
    output = collections.OrderedDict()
    for component in ['swim', 't1', 'cycle', 't2', 'run', 'time']:
        df[component] = df[component].map(convert_run_to_seconds)
        df = df[df[component] != -1]
    for component in ['swim', 'cycle', 'run', 't1', 't2', 'time']:
        min_time = df[component].min()
        max_time = df[component].max() + 0.1
        n_bins = 20;
        bin_width = 1. * (max_time - min_time) / n_bins;
        histo = {}
        histo['min'] = min_time
        histo['max'] = max_time
        histo['n_bins'] = n_bins
        histo['bin_width'] = bin_width
        histo['bins'] = []
        max_count = None
        for bin_index in range(n_bins):
            lower = min_time + bin_index * bin_width
            upper = lower + bin_width
            middle = (lower + upper) / 2.
            count = len(df[(df[component] >= lower) & (df[component] < upper)])
            if max_count == None or count > max_count:
                max_count = count
            histo['bins'] += [
                {
                    'lower': lower,
                    'upper': upper,
                    'middle': middle,
                    'count': count,
                    }
                ]
        histo['max_count'] = max_count
        output[component] = {
            'mean': df[component].mean(),
            'std': df[component].std(),
            'median': df[component].median(),
            '1st_quartile': df[component].quantile(0.25),
            '3rd_quartile': df[component].quantile(0.75),
            'histo': histo,
            }
    return HttpResponse(json.dumps(output), content_type="application/json")
