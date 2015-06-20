import pandas
import django
from django.db.models import Model, CharField, PositiveIntegerField

class Participant(django.db.models.Model):
    position = PositiveIntegerField()
    bib_number = PositiveIntegerField()
    name = CharField(max_length=50)
    time = CharField(max_length=50)
    category_choices = [
        ('Senior', 'Senior'),
        ('Veteran', 'Veteran 35-49'),
        ('Veteran+', 'Veteran 50+',),
        ]
    category = CharField(max_length=50, choices=category_choices, null=False)
    cat_pos = PositiveIntegerField()
    gender = CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')], null=False)
    g_pos = PositiveIntegerField()
    club = CharField(max_length=100)
    swim = CharField(max_length=50)
    g_pos_swim = PositiveIntegerField()
    t1 = CharField(max_length=50)
    cycle = CharField(max_length=50)
    g_pos_cycle = CharField(max_length=50)
    t2 = CharField(max_length=50)
    run = CharField(max_length=50)
    g_pos_run = CharField(max_length=50)
    def __str__(self):
        return self.name
    @classmethod
    def data_frame(cls):
        cols = ['position', 'bib_number', 'name', 'time', 'category', 
                'cat_pos', 'gender', 'g_pos', 'club', 'swim', 
                'g_pos_swim', 't1', 'cycle', 'g_pos_cycle', 't2', 
                'run', 'g_pos_run']
        x = {}
        for key in cols:
            x[key] = []
        for participant in cls.objects.all():
            for key in cols:
                x[key] += [getattr(participant, key)]
        data_frame = pandas.DataFrame(x)
        data_frame.set_index('name')
        return data_frame
