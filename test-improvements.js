const improvements = [];

function add(category, location, description, severity, suggestion) {
  improvements.push({ category, location, description, severity, suggestion });
}

// ============================================
// 1. LANDING PAGE IMPROVEMENTS (10)
// ============================================
add('UX', 'Landing Page', 'No hero image or illustration - looks plain', 'Medium', 'Add a hero image of organic soaps');
add('UI', 'Landing Page', 'Green banner could be more visually appealing', 'Low', 'Add subtle texture or pattern');
add('Content', 'Landing Page', 'No social proof or customer testimonials', 'Medium', 'Add testimonials section');
add('Content', 'Landing Page', 'No FAQ section', 'Medium', 'Add common questions about soap making');
add('UX', 'Landing Page', 'Start Building button could have better hover animation', 'Low', 'Add scale transform on hover');
add('Accessibility', 'Landing Page', 'Skip to content link missing for keyboard users', 'High', 'Add skip navigation link');
add('Content', 'Landing Page', 'No pricing information visible before starting', 'Medium', 'Show approximate pricing range');
add('UX', 'Landing Page', 'How It Works section could use icons', 'Low', 'Add visual icons for each step');
add('Mobile', 'Landing Page', 'Banner text may wrap poorly on very small screens', 'Low', 'Add responsive text sizing');
add('Content', 'Landing Page', 'No trust badges (organic certification, etc.)', 'Medium', 'Add certification badges');

// ============================================
// 2. SCENT SELECTION IMPROVEMENTS (10)
// ============================================
add('UI', 'Scent Selection', 'Scent cards look identical - no visual hierarchy for selected', 'Low', 'Add stronger border or background for selected');
add('UX', 'Scent Selection', 'No search or filter functionality for scents', 'Medium', 'Add quick filter buttons (Floral, Fresh, Spicy)');
add('Accessibility', 'Scent Selection', 'Scent descriptions have low contrast', 'Low', 'Increase text contrast');
add('Content', 'Scent Selection', 'Lavender and Honey have extra cost but not prominently shown', 'Medium', 'Show +Rs. 5 badge on scent cards');
add('UX', 'Scent Selection', 'Hover states are subtle', 'Low', 'Make hover effect more obvious');
add('UI', 'Scent Selection', '9 scents in 3-column grid - works but could be 2-row layout', 'Low', 'Consider 2x2 + 3x1 layout');
add('Content', 'Scent Selection', 'No scent popularity indicators', 'Low', 'Add Most Popular badge to Lavender');
add('Content', 'Scent Selection', 'Clove description Warm & spicy is vague', 'Low', 'Add more descriptive text');
add('UX', 'Scent Selection', 'Keyboard navigation not clearly indicated', 'Medium', 'Add focus-visible outlines');
add('Content', 'Scent Selection', 'No ingredient list per scent', 'Low', 'Show key ingredients');

// ============================================
// 3. SIZE SELECTION IMPROVEMENTS (8)
// ============================================
add('UI', 'Size Selection', 'Size buttons lack visual distinction', 'Low', 'Add size icons or visual weight indicators');
add('Content', 'Size Selection', 'No weight-to-price comparison shown', 'Medium', 'Show price per gram/ml');
add('UX', 'Size Selection', 'S size button is first but L is most popular', 'Low', 'Reorder as M, L, S or highlight recommended');
add('Accessibility', 'Size Selection', 'Selected size not announced to screen readers', 'Medium', 'Add ARIA live region for selection');
add('Content', 'Size Selection', 'No minimum order information', 'Low', 'Show minimum quantity info');
add('UI', 'Size Selection', 'Active state uses thin border - hard to see', 'Medium', 'Use thicker border or background color');
add('UX', 'Size Selection', 'Cannot select multiple sizes for same scent', 'Low', 'Consider Add another size option');
add('Content', 'Size Selection', 'No volume equivalent shown (50ml, 75ml, 100ml)', 'Low', 'Add ml equivalent in parentheses');

// ============================================
// 4. LAVENDER PIECES OPTION (5)
// ============================================
add('UI', 'Lavender Pieces', 'Toggle button lacks visual feedback when active', 'Medium', 'Add checkmark icon or color change');
add('Content', 'Lavender Pieces', '+Rs. 5 shown but no per soap clarification', 'Medium', 'Clarify pricing (per soap vs total)');
add('UX', 'Lavender Pieces', 'Option appears only for Lavender - confusing for other scents', 'Low', 'Show message Not available for other scents');
add('Content', 'Lavender Pieces', 'No description of what lavender pieces are', 'Low', 'Add brief explanation tooltip');
add('Accessibility', 'Lavender Pieces', 'Toggle not keyboard accessible', 'High', 'Make it a proper button with keyboard support');

// ============================================
// 5. CONTINUE FLOW (5)
// ============================================
add('UX', 'Continue Flow', 'Continue button disabled until all selections made - no guidance', 'High', 'Show required fields in red or show helper text');
add('Accessibility', 'Continue Flow', 'Disabled button still receives focus', 'Medium', 'Remove from tab order when disabled');
add('UI', 'Continue Flow', 'Progress indicator is subtle', 'Low', 'Make active step more prominent');
add('UX', 'Continue Flow', 'Can go back but cannot edit previous selections easily', 'Medium', 'Add edit icons next to completed steps');
add('Content', 'Continue Flow', 'Step labels are small and easy to miss', 'Low', 'Increase font size and add icons');

// ============================================
// 6. COLOR SELECTION (8)
// ============================================
add('UI', 'Color Selection', 'Color swatches are small', 'Low', 'Increase size for better visibility');
add('Content', 'Color Selection', 'No color names for colorblind users', 'Medium', 'Add text labels under swatches');
add('UX', 'Color Selection', 'Selected color not clearly indicated', 'Medium', 'Add checkmark or border to selected color');
add('Content', 'Color Selection', 'No note about natural colors for Coffee/Turmeric', 'Medium', 'Show hint Natural color: Brown for these');
add('Accessibility', 'Color Selection', 'Colors may not have sufficient contrast', 'Low', 'Check and adjust color values');
add('UX', 'Color Selection', 'White color on light background has low contrast', 'Medium', 'Add border or shadow to white swatch');
add('Content', 'Color Selection', 'No popular color suggestions', 'Low', 'Add Most Popular: Purple badge');
add('UI', 'Color Selection', '7 colors in row - may overflow on small screens', 'Medium', 'Wrap to multiple lines on mobile');

// ============================================
// 7. QUANTITY SELECTION (10)
// ============================================
add('UX', 'Quantity Selection', 'Quantity input accepts decimals', 'Low', 'Restrict to whole numbers');
add('UX', 'Quantity Selection', 'No minimum/maximum validation shown', 'Medium', 'Show min: 1, max: 100');
add('UI', 'Quantity Selection', 'Preset buttons (1, 3, 5, 10) are small', 'Low', 'Increase button size');
add('Content', 'Quantity Selection', 'No custom quantity guidance', 'Low', 'Add placeholder text');
add('UX', 'Quantity Selection', 'Bulk discount notification is easy to miss', 'High', 'Make it more prominent with animation');
add('Accessibility', 'Quantity Selection', 'Discount notification not announced', 'Medium', 'Add ARIA live region');
add('UX', 'Quantity Selection', 'No quick add for bulk (20, 50, 100)', 'Low', 'Add more preset options');
add('UI', 'Quantity Selection', 'Discount text 10% OFF should be more prominent', 'Medium', 'Use larger, bolder text');
add('Content', 'Quantity Selection', 'Mix & match message is too subtle', 'High', 'Add icon and make more visible');
add('UX', 'Quantity Selection', 'Price updates but no animation to draw attention', 'Low', 'Animate price change');

// ============================================
// 8. ADD TO CART (9)
// ============================================
add('UX', 'Add to Cart', 'Button shows Added to cart toast briefly - easy to miss', 'Medium', 'Make toast larger and persist longer');
add('UI', 'Add to Cart', 'Toast notification styling is plain', 'Low', 'Add icon and better colors');
add('UX', 'Add to Cart', 'After adding, user must manually start new soap', 'Medium', 'Show Continue shopping button');
add('Accessibility', 'Add to Cart', 'Toast not accessible to screen readers', 'High', 'Add ARIA live region to toast');
add('UX', 'Add to Cart', 'Rate limiting not communicated clearly', 'Medium', 'Show cooldown countdown');
add('UI', 'Add to Cart', 'Add Another button disabled styling is confusing', 'Low', 'Add Complete current item first message');
add('Content', 'Add to Cart', 'Submission limit (10/10) shown but purpose unclear', 'Low', 'Add tooltip explaining limit');
add('UX', 'Add to Cart', 'No way to edit item after adding', 'Medium', 'Add edit/remove from cart option');
add('UI', 'Add to Cart', 'Loading state during add is subtle', 'Low', 'Add spinner or disable button with text change');

// ============================================
// 9. CART SIDEBAR - OPEN/CLOSE (7)
// ============================================
add('UX', 'Cart Sidebar', 'Cart badge number not animated on update', 'Low', 'Add bounce animation');
add('UI', 'Cart Sidebar', 'Cart button fixed position covers content on mobile', 'Medium', 'Adjust position for mobile');
add('UX', 'Cart Sidebar', 'No keyboard shortcut to open cart', 'Low', 'Add Ctrl+K or similar');
add('Accessibility', 'Cart Sidebar', 'Cart sidebar focus trap missing', 'High', 'Implement proper focus management');
add('UX', 'Cart Sidebar', 'Backdrop click closes cart but no visual feedback', 'Low', 'Add cursor pointer to backdrop');
add('UI', 'Cart Sidebar', 'Close button small and hard to tap', 'Low', 'Increase hit area');
add('UX', 'Cart Sidebar', 'No swipe to close on mobile', 'Medium', 'Add touch swipe support');

// ============================================
// 10. CART ITEMS DISPLAY (9)
// ============================================
add('UI', 'Cart Items', 'Item cards look cluttered', 'Low', 'Simplify layout with better spacing');
add('Content', 'Cart Items', 'No product image preview', 'Low', 'Add small color swatch preview');
add('UX', 'Cart Items', 'Cannot change quantity from cart', 'Medium', 'Add +/- buttons in cart');
add('UX', 'Cart Items', 'Remove button requires tap - no undo option', 'Medium', 'Add Undo toast after removal');
add('Accessibility', 'Cart Items', 'Remove button not clearly labeled', 'Low', 'Add aria-label=Remove item');
add('Content', 'Cart Items', 'No item summary or notes section', 'Low', 'Add gift wrap option');
add('UX', 'Cart Items', 'Long item names may overflow', 'Low', 'Add text truncation');
add('UI', 'Cart Items', 'Price per item and total shown but confusing', 'Medium', 'Simplify to show only line totals');
add('Content', 'Cart Items', 'Lavender pieces not shown in cart item summary', 'Medium', 'Include + Lavender Pieces in description');

// ============================================
// 11. CART DISCOUNT DISPLAY (8)
// ============================================
add('UX', 'Cart Discount', 'Discount banner small - easy to miss', 'High', 'Make banner larger and more colorful');
add('Content', 'Cart Discount', 'Discount percentage not highlighted', 'Medium', 'Show 10% OFF in large text');
add('UX', 'Cart Discount', 'Original price strikethrough too subtle', 'Low', 'Make strikethrough more visible');
add('Content', 'Cart Discount', 'No You saved Rs. X! message', 'Medium', 'Add savings highlight');
add('Accessibility', 'Cart Discount', 'Discount not announced when cart opens', 'Medium', 'Add live region update');
add('UI', 'Cart Discount', 'Discount section blends with other content', 'Low', 'Use distinct background color');
add('Content', 'Cart Discount', 'No progress indicator for next discount tier', 'Medium', 'Add Add 1 more for 15% off!');
add('UX', 'Cart Discount', 'Mixed scents discount not clearly explained', 'High', 'Add explicit Applies to all items message');

// ============================================
// 12. CART FOOTER (8)
// ============================================
add('UI', 'Cart Footer', 'Footer feels disconnected from items', 'Low', 'Add shadow or border');
add('UX', 'Cart Footer', 'Submit button far from cart total', 'Low', 'Group total and button together');
add('Content', 'Cart Footer', 'No order summary breakdown', 'Medium', 'Show subtotal, discount, shipping estimate');
add('UX', 'Cart Footer', 'Clear Cart button easy to click accidentally', 'High', 'Add confirmation dialog');
add('Accessibility', 'Cart Footer', 'Submit button not labeled with order total', 'Medium', 'Add aria-label with total');
add('UI', 'Cart Footer', 'Total font size same as other text', 'Low', 'Make total larger and bolder');
add('Content', 'Cart Footer', 'No estimated delivery date', 'Low', 'Add delivery estimate');
add('UX', 'Cart Footer', 'Cannot scroll to see all items before submitting', 'Medium', 'Adjust scroll behavior');

// ============================================
// 13. CHECKOUT FORM (10)
// ============================================
add('UX', 'Checkout Form', 'Form fields lack icons for context', 'Low', 'Add icons (user, email, phone icons)');
add('Accessibility', 'Checkout Form', 'Error messages not associated with fields', 'High', 'Add aria-describedby');
add('UX', 'Checkout Form', 'Validation triggers on blur but not on submit', 'Medium', 'Validate on submit attempt');
add('UI', 'Checkout Form', 'Error text is small and low contrast', 'Low', 'Increase error text size');
add('Content', 'Checkout Form', 'Phone format hint unclear', 'Medium', 'Show example: (555) 123-4567');
add('UX', 'Checkout Form', 'No autofill support', 'Low', 'Add autocomplete attributes');
add('Accessibility', 'Checkout Form', 'Required fields not marked', 'Medium', 'Add asterisk and aria-required');
add('UX', 'Checkout Form', 'Submit button shows loading state but no cancel option', 'Low', 'Add cancel button during loading');
add('Content', 'Checkout Form', 'No privacy policy link', 'Medium', 'Add link to privacy policy');
add('UI', 'Checkout Form', 'Form labels could be larger', 'Low', 'Increase label font size');

// ============================================
// 14. ORDER SUBMISSION (10)
// ============================================
add('UX', 'Order Submission', 'No order ID shown after submission', 'Medium', 'Show order ID for reference');
add('UI', 'Order Submission', 'Success screen is plain', 'Low', 'Add celebration animation or icon');
add('Content', 'Order Submission', 'No email confirmation message', 'Medium', 'Show Check your email for confirmation');
add('UX', 'Order Submission', 'No way to print or save order', 'Low', 'Add Print receipt button');
add('Accessibility', 'Order Submission', 'Success message not announced', 'High', 'Add ARIA live region');
add('UX', 'Order Submission', 'Order More button clears form without confirmation', 'Low', 'Confirm before clearing');
add('Content', 'Order Submission', 'No thank you message personalization', 'Low', 'Include customer name');
add('UX', 'Order Submission', 'After submitting, user must start completely over', 'Medium', 'Remember selections for quick reorder');
add('Content', 'Order Submission', 'No estimated processing time shown', 'Low', 'Show Well process in 1-2 days');
add('UI', 'Order Submission', 'Submission count resets without feedback', 'Low', 'Show Submissions reset! message');

// ============================================
// 15. RATE LIMITING (4)
// ============================================
add('UX', 'Rate Limiting', 'Cooldown timer not visible during submission', 'Medium', 'Show countdown in button');
add('Content', 'Rate Limiting', 'No explanation of why limit exists', 'Low', 'Add To prevent spam note');
add('UI', 'Rate Limiting', 'Rate limit indicator is subtle', 'Low', 'Make progress bar more visible');
add('UX', 'Rate Limiting', 'No way to contact for higher limits', 'Low', 'Add Contact us for bulk orders');

// ============================================
// 16. ERROR HANDLING (6)
// ============================================
add('UX', 'Error Handling', 'No network error recovery options', 'Medium', 'Add Retry button');
add('Accessibility', 'Error Handling', 'Error messages not read to screen readers', 'High', 'Implement proper ARIA alerts');
add('UX', 'Error Handling', 'Generic error messages (e.g., An error occurred)', 'Medium', 'Show specific error details');
add('UI', 'Error Handling', 'Error states lack visual distinction', 'Low', 'Use red borders, icons, backgrounds');
add('UX', 'Error Handling', 'No offline mode indicator', 'Medium', 'Show Youre offline banner');
add('Content', 'Error Handling', 'No support contact information', 'Low', 'Add help email or phone');

// ============================================
// 17. LOADING STATES (5)
// ============================================
add('UX', 'Loading States', 'Initial load shows plain Preparing text', 'Low', 'Add spinner or skeleton loader');
add('UI', 'Loading States', 'Loading spinner color clashes with theme', 'Low', 'Use earth tones for spinner');
add('UX', 'Loading States', 'No progress indication during checkout', 'Medium', 'Show step-by-step progress');
add('Accessibility', 'Loading States', 'Loading state not announced', 'Medium', 'Add Loading live region');
add('UX', 'Loading States', 'Cart loading has no feedback', 'Low', 'Add skeleton for cart items');

// Output summary
console.log('='.repeat(60));
console.log('TOTAL IMPROVEMENTS FOUND: ' + improvements.length);
console.log('='.repeat(60));

const bySeverity = improvements.reduce((acc, imp) => {
  acc[imp.severity] = (acc[imp.severity] || 0) + 1;
  return acc;
}, {});

console.log('\nBy Severity:');
console.log('  Critical:', bySeverity['Critical'] || 0);
console.log('  High:', bySeverity['High'] || 0);
console.log('  Medium:', bySeverity['Medium'] || 0);
console.log('  Low:', bySeverity['Low'] || 0);

const byCategory = improvements.reduce((acc, imp) => {
  acc[imp.category] = (acc[imp.category] || 0) + 1;
  return acc;
}, {});

console.log('\nBy Category:');
for (const [cat, count] of Object.entries(byCategory)) {
  console.log('  ' + cat + ':', count);
}

console.log('\n' + '='.repeat(60));
console.log('TOP 25 HIGHEST PRIORITY IMPROVEMENTS:');
console.log('='.repeat(60));

const highPriority = improvements
  .filter(imp => imp.severity === 'Critical' || imp.severity === 'High')
  .slice(0, 25);

highPriority.forEach((imp, i) => {
  console.log('\n' + (i + 1) + '. [' + imp.severity + '] ' + imp.category + ' - ' + imp.location);
  console.log('   ' + imp.description);
  if (imp.suggestion) {
    console.log('   Fix: ' + imp.suggestion);
  }
});

// Export for further use
module.exports = { improvements };
