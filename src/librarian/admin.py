from django.contrib import admin

from librarian.models import Patch, PatchBank, PatchPosition

admin.site.register(Patch)
admin.site.register(PatchBank)
admin.site.register(PatchPosition)
