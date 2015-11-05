from django.db import models
from django.contrib.auth.models import User

MACHINE_CHOICES = (
    ('elektron_md', 'Elektron Machinedrum'),
    ('yamaha_dx7', 'Yamaha DX7'),
)

class Patch(models.Model):
    name = models.CharField(max_length=255)
    sysex_file = models.FileField(blank=True, null=True)
    machine = models.CharField(max_length=40, choices=MACHINE_CHOICES)

    user = models.ForeignKey(User, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PatchBank(models.Model):
    name = models.CharField(max_length=255)
    sysex_file = models.FileField(blank=True, null=True)
    machine = models.CharField(max_length=40, choices=MACHINE_CHOICES)

    patches = models.ManyToManyField(Patch, through='PatchPosition')

    user = models.ForeignKey(User, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class PatchPosition(models.Model):
    patch = models.ForeignKey(Patch)
    patch_bank = models.ForeignKey(PatchBank)
    position = models.IntegerField(default=0)
