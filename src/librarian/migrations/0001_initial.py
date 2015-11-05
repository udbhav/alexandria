# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Patch',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('sysex_file', models.FileField(null=True, upload_to=b'', blank=True)),
                ('machine', models.CharField(max_length=40, choices=[(b'elektron_md', b'Elektron Machinedrum'), (b'yamaha_dx7', b'Yamaha DX7')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='PatchBank',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('sysex_file', models.FileField(null=True, upload_to=b'', blank=True)),
                ('machine', models.CharField(max_length=40, choices=[(b'elektron_md', b'Elektron Machinedrum'), (b'yamaha_dx7', b'Yamaha DX7')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='PatchPosition',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('position', models.IntegerField(default=0)),
                ('patch', models.ForeignKey(to='librarian.Patch')),
                ('patch_bank', models.ForeignKey(to='librarian.PatchBank')),
            ],
        ),
        migrations.AddField(
            model_name='patchbank',
            name='patches',
            field=models.ManyToManyField(to='librarian.Patch', through='librarian.PatchPosition'),
        ),
        migrations.AddField(
            model_name='patchbank',
            name='user',
            field=models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
