import json
import datetime
from triathlon.models import Participant
df = Participant.data_frame()
def convert_time_to_seconds(time):
    try:
        output = datetime.datetime.strptime(time, '%H:%M:%S.%f') - datetime.datetime.strptime('00:', '%H:')
        output = output.seconds + output.microseconds * 1e-6
    except ValueError:
        output = -1
    return output
    
df['time_in_seconds'] = df['time'].map(convert_time_to_seconds)
df = df[['position', 'time_in_seconds']]
df['time_in_seconds'].name = 'time'
output = df.T.to_dict().values()
output = json.dumps(output)
