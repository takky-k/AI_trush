from django.db import models

class WasteItem(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    collection_day = models.CharField(max_length=20)

    def __str__(self):
        return self.name

