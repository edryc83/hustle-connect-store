

## Remove Customer Name from WhatsApp Order Message

### Change

In `src/pages/Storefront.tsx`, line 298, remove the line that appends the customer/visitor name to the WhatsApp message:

```tsx
// Remove this line:
if (visitorName) lines.push(``, `👤 Customer: ${visitorName}`);
```

Similarly check and remove customer name from `CartDrawer.tsx` and `OrderModal.tsx` WhatsApp messages (lines referencing `customer_name` or `visitorName` in the message text). The name will still be logged to the orders database — just not included in the WhatsApp message text.

### Files to Edit
- `src/pages/Storefront.tsx` — remove line 298
- `src/components/storefront/CartDrawer.tsx` — remove customer name from checkout message
- `src/components/storefront/OrderModal.tsx` — remove customer name from order message

