from rest_framework import serializers
from .models import Quote, QuoteItem
from products.serializers import ProductSerializer
from decimal import Decimal


class QuoteItemSerializer(serializers.ModelSerializer):
    """
    Serializer for QuoteItem model.
    """
    product_name = serializers.ReadOnlyField()
    product_sku = serializers.ReadOnlyField()
    
    class Meta:
        model = QuoteItem
        fields = [
            'id',
            'quote',
            'product',
            'product_name',
            'product_sku',
            'description',
            'quantity',
            'unit_price',
            'line_total',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'line_total', 'created_at', 'updated_at']
    
    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
    
    def validate_unit_price(self, value):
        """Ensure unit price is non-negative"""
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative.")
        return value


class QuoteItemCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating quote items (without quote field).
    """
    product_name = serializers.ReadOnlyField()
    product_sku = serializers.ReadOnlyField()
    
    class Meta:
        model = QuoteItem
        fields = [
            'id',
            'product',
            'product_name',
            'product_sku',
            'description',
            'quantity',
            'unit_price',
            'line_total',
            'sort_order',
        ]
        read_only_fields = ['id', 'line_total']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
    
    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative.")
        return value


class QuoteSerializer(serializers.ModelSerializer):
    """
    Serializer for Quote model with nested items and total validation.
    """
    items = QuoteItemCreateSerializer(many=True, required=False)
    organization_name = serializers.ReadOnlyField()
    contact_name = serializers.ReadOnlyField()
    lead_title = serializers.ReadOnlyField()
    created_by_email = serializers.ReadOnlyField()
    
    class Meta:
        model = Quote
        fields = [
            'id',
            'quote_number',
            'organization',
            'organization_name',
            'contact',
            'contact_name',
            'lead',
            'lead_title',
            'created_by',
            'created_by_email',
            'status',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'discount_amount',
            'total',
            'expiry_date',
            'notes',
            'terms',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def validate_quote_number(self, value):
        """Ensure quote number is unique (case-insensitive)"""
        quote_number = value.strip().upper()
        if self.instance:
            # Update case - exclude current instance
            if Quote.objects.filter(quote_number__iexact=quote_number).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A quote with this number already exists.")
        else:
            # Create case
            if Quote.objects.filter(quote_number__iexact=quote_number).exists():
                raise serializers.ValidationError("A quote with this number already exists.")
        return quote_number
    
    def validate(self, attrs):
        """
        Validate that totals match the sum of items.
        """
        items_data = attrs.get('items', [])
        subtotal = attrs.get('subtotal', Decimal('0'))
        tax_rate = attrs.get('tax_rate', Decimal('0'))
        tax_amount = attrs.get('tax_amount', Decimal('0'))
        discount_amount = attrs.get('discount_amount', Decimal('0'))
        total = attrs.get('total', Decimal('0'))
        
        # Calculate expected subtotal from items
        if items_data:
            calculated_subtotal = sum(
                Decimal(str(item['quantity'])) * Decimal(str(item['unit_price']))
                for item in items_data
            )
            
            # Allow small rounding differences (0.01)
            if abs(calculated_subtotal - Decimal(str(subtotal))) > Decimal('0.01'):
                raise serializers.ValidationError({
                    'subtotal': f'Subtotal {subtotal} does not match sum of items {calculated_subtotal}'
                })
        
        # Validate tax calculation
        calculated_tax = (Decimal(str(subtotal)) * Decimal(str(tax_rate))) / Decimal('100')
        if abs(calculated_tax - Decimal(str(tax_amount))) > Decimal('0.01'):
            raise serializers.ValidationError({
                'tax_amount': f'Tax amount {tax_amount} does not match calculated tax {calculated_tax}'
            })
        
        # Validate total calculation
        calculated_total = Decimal(str(subtotal)) + Decimal(str(tax_amount)) - Decimal(str(discount_amount))
        if abs(calculated_total - Decimal(str(total))) > Decimal('0.01'):
            raise serializers.ValidationError({
                'total': f'Total {total} does not match calculated total {calculated_total}'
            })
        
        # Ensure discount doesn't exceed subtotal + tax
        if Decimal(str(discount_amount)) > (Decimal(str(subtotal)) + Decimal(str(tax_amount))):
            raise serializers.ValidationError({
                'discount_amount': 'Discount cannot exceed subtotal plus tax'
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create quote with nested items.
        """
        items_data = validated_data.pop('items', [])
        
        # Auto-assign created_by from request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        quote = Quote.objects.create(**validated_data)
        
        # Create quote items
        for item_data in items_data:
            QuoteItem.objects.create(quote=quote, **item_data)
        
        return quote
    
    def update(self, instance, validated_data):
        """
        Update quote with nested items.
        """
        items_data = validated_data.pop('items', None)
        
        # Update quote fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                QuoteItem.objects.create(quote=instance, **item_data)
        
        return instance


class QuoteListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views (without nested items).
    """
    organization_name = serializers.ReadOnlyField()
    contact_name = serializers.ReadOnlyField()
    created_by_email = serializers.ReadOnlyField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quote
        fields = [
            'id',
            'quote_number',
            'organization',
            'organization_name',
            'contact',
            'contact_name',
            'created_by_email',
            'status',
            'subtotal',
            'tax_amount',
            'discount_amount',
            'total',
            'expiry_date',
            'items_count',
            'created_at',
            'updated_at',
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
