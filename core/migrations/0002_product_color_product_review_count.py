from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="color",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="product",
            name="review_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
