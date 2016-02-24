from rest_framework import serializers, viewsets

from librarian.models import Patch, PatchBank

class PatchSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Patch
        fields = ('name', 'user', 'created_at', 'updated_at', 'data')

class PatchViewSet(viewsets.ModelViewSet):
    queryset = Patch.objects.filter(public=True)
    serializer_class = PatchSerializer

class PatchBankSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PatchBank
        fields = ('name', 'user', 'created_at', 'updated_at', 'data')

class PatchBankViewSet(viewsets.ModelViewSet):
    queryset = PatchBank.objects.filter(public=True)
    serializer_class = PatchBankSerializer
