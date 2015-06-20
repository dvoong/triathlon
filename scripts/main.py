import openpyxl, xlrd
from triathlon.models import Participant
filepath = '/Users/admin/projects/triathlon/virtualenv/triathlon/data/TriBristolStandard2014Results.xls' 

# f = open('')
# wb2 = openpyxl.load_workbook('/Users/admin/projects/triathlon/virtualenv/triathlon/data/TriBristolStandard2014Results.xls')

wb = xlrd.open_workbook(filepath)
sheet = wb.sheets()[0]
n_rows = len(sheet.col(0))

for row_index in range(1, n_rows):
    row = sheet.row(row_index)
    values = sheet.row_values(row_index)
    pos = values[0]
    bib = values[1]
    name = values[4]
    time = values[5]
    cat = values[6]
    cat_pos = values[7]
    gender = values[8]
    g_pos = values[9]
    club = values[10]
    swim = values[11]
    g_pos_swim = values[12]
    t1 = values[13]
    g_pos_t1 = values[14]
    cycle = values[15]
    g_pos_cycle = values[16]
    t2 = values[17]
    g_pos_t2 = values[18]
    run = values[19]
    g_pos_run = values[20]
    
    print values

    category_dict = {
        'Senior': 'Senior',
        'Vet 35-49': 'Veteran',
        'Super Vet 50+': 'Veteran+'
        }

    try:
        participant = Participant.objects.get(name=name)
        participant.category = category_dict[cat]
    except ObjectDoesNotExist:
        participant = Participant(
            position=pos,
            bib_number=bib,
            name=name,
            time = time,
            category=category_dict[cat],
            cat_pos=cat_pos,
            gender='M' if gender == 'Male' else 'F',
            g_pos=g_pos,
            club=club,
            swim=swim,
            g_pos_swim=g_pos_swim,
            t1=t1,
            cycle=cycle,
            g_pos_cycle=g_pos_cycle,
            t2=t2,
            run=run,
            g_pos_run=g_pos_run)
        
    print participant
    participant.save()
