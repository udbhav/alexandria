from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from rest_framework import routers, serializers, viewsets

# from librarian.views import AppView
# from librarian import urls as librarian_urls
from librarian.api import PatchViewSet, PatchBankViewSet

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

router = routers.DefaultRouter()
router.register(r'patches', PatchViewSet)
router.register(r'patch_banks', PatchBankViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # url(r'^$',
    #     login_required(
    #         AppView.as_view())
    #     , {}, name='home'),
    # url(r'^librarian/', include(librarian_urls)),

    url(r'^api/v1/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
]
