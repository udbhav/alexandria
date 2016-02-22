# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'json'

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.network "private_network", ip: "192.168.50.4"

  config.vm.synced_folder ".", "/alexandria", type: "nfs"
  config.bindfs.bind_folder "/alexandria", "/home/vagrant/app"

  config.omnibus.chef_version = :latest

  config.berkshelf.enabled = true
  config.vm.provision "chef_solo" do |chef|
    chef.add_recipe "mizra::default"
    chef.json = {
      "postgresql" => {
        "password" => { "postgres" => "postgres" }
      }
    }
  end
end
