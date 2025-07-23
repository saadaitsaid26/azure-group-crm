from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model with validation.
    """
    class Meta:
        model = Product
        fields = [
            'id',
            'sku',
            'name',
            'description',
            'category',
            'price',
            'cost',
            'status',
            'metadata',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_sku(self, value):
        """Ensure SKU is unique (case-insensitive)"""
        sku = value.strip().upper()
        if self.instance:
            # Update case - exclude current instance
            if Product.objects.filter(sku__iexact=sku).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        else:
            # Create case
            if Product.objects.filter(sku__iexact=sku).exists():
                raise serializers.ValidationError("A product with this SKU already exists.")
        return sku
    
    def validate_price(self, value):
        """Ensure price is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
    
    def validate_cost(self, value):
        """Ensure cost is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Cost cannot be negative.")
        return value
