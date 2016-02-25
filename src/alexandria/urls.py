from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

from librarian.views import AppView
from librarian import urls as librarian_urls
from librarian.api import (
    PatchSerializer, PatchBankSerializer, PatchViewSet, PatchBankViewSet)
from librarian.models import Patch, PatchBank

class UserSerializer(serializers.HyperlinkedModelSerializer):
    patches = serializers.SerializerMethodField()
    patchbanks = serializers.SerializerMethodField()

    def get_permissioned_items(self, user, attr, serializer_cls):
        qs = getattr(user, attr)
        if self.context['request'].user == user:
            items = qs.all()
        else:
            items = qs.filter(public=True)

        s = serializer_cls(instance=items, many=True, context=self.context)
        return [{'url': x['url'], 'name': x['name']} for x in s.data]

    def get_patches(self, user):
        return self.get_permissioned_items(user, 'patches', PatchSerializer)

    def get_patchbanks(self, user):
        return self.get_permissioned_items(user, 'patch_banks', PatchBankSerializer)

    class Meta:
        model = User
        fields = ('url', 'username', 'patches', 'patchbanks')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

router = routers.DefaultRouter()
router.register(r'patches', PatchViewSet, 'patch')
router.register(r'patchbanks', PatchBankViewSet, 'patchbank')
router.register(r'users', UserViewSet)

urlpatterns = [
    url(r'^api/v1/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    url(r'^$',
        login_required(
            AppView.as_view())
        , {}, name='home'),
    url(r'^librarian/', include(librarian_urls)),

    url(r'^admin/', include(admin.site.urls)),
]
