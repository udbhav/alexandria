from django.db.models import Q
from rest_framework import serializers, viewsets, generics, permissions, status
from rest_framework.response import Response

from librarian.models import Patch, PatchBank

class UserPermission(permissions.DjangoModelPermissionsOrAnonReadOnly):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return (
                obj.public or
                (request.user.is_authenticated() and obj.user == request.user))
        else:
            return request.user.is_authenticated() and obj.user == request.user

class PatchSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Patch
        fields = (
            'id', 'url', 'name', 'user', 'public',
            'data', 'created_at', 'updated_at')
        read_only_fields = ('user',)

class PatchBankSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PatchBank
        fields = (
            'url', 'name', 'user', 'public',
            'data', 'created_at', 'updated_at')
        read_only_fields = ('user',)

class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = (UserPermission,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        instance.user = request.user
        instance.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        if self.request.user.is_authenticated():
            return self.model.objects.filter(
                Q(public=True) | Q(user=self.request.user))
        else:
            return self.model.objects.filter(public=True)

class PatchViewSet(BaseViewSet):
    serializer_class = PatchSerializer
    model = Patch

class PatchBankViewSet(BaseViewSet):
    serializer_class = PatchBankSerializer
    model = PatchBank
