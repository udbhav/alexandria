from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

class BaseModel(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return self.name

    class Meta:
        abstract = True

MACHINE_CHOICES = (
    ('elektron_md', 'Elektron Machinedrum'),
    ('yamaha_dx7', 'Yamaha DX7'),
)

class WithMachine(models.Model):
    machine = models.CharField(max_length=40, choices=MACHINE_CHOICES)
    sysex_file = models.FileField(blank=True, null=True)
    data = JSONField(blank=True, null=True)
    public = models.BooleanField(default=False)

    class Meta:
        abstract = True

class Patch(BaseModel, WithMachine):
    user = models.ForeignKey(User, related_name="patches", blank=True, null=True)

    class Meta:
        verbose_name_plural = "patches"

class PatchBank(BaseModel, WithMachine):
    user = models.ForeignKey(User, related_name="patch_banks", blank=True, null=True)
    patches = models.ManyToManyField(Patch, through='PatchPosition')

class PatchPosition(models.Model):
    patch = models.ForeignKey(Patch)
    patch_bank = models.ForeignKey(PatchBank)
    position = models.IntegerField(default=0)
