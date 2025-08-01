// Task name mapping function - converts old task names to new kebab-case format
function mapTaskName(oldTaskName) {
    const taskNameLower = oldTaskName.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // New format task names (already in kebab-case)
    if (taskNameLower === 'collect-requirement') return 'collect-requirement'
    if (taskNameLower === 'collect-eoi') return 'collect-eoi'
    if (taskNameLower === 'loan-discussion') return 'loan-discussion'
    if (taskNameLower === 'plan-site-visit') return 'plan-site-visit'
    if (taskNameLower === 'tds-payment') return 'tds-payment'
    if (taskNameLower === 'lead-registration') return 'lead-registration'
    if (taskNameLower === 'other-discussion') return 'other-discussion'
    if (taskNameLower === 'collect-emd') return 'collect-emd'
    if (taskNameLower === 'help-in-bidding') return 'help-in-bidding'
    if (taskNameLower === 'customer-kyc') return 'customer-kyc'
    if (taskNameLower === 'create-site-credential') return 'create-site-credential'
    if (taskNameLower === 'emd-amount-return') return 'emd-amount-return'
    if (taskNameLower === 'confirm-25-payment') return 'confirm-25-payment'
    if (taskNameLower === 'raise-invoice') return 'raise-invoice'
    if (taskNameLower === 'unit-booking') return 'unit-booking'
    if (taskNameLower === 'rent-collection') return 'rent-collection'
    if (taskNameLower === 'find-tenant') return 'find-tenant'
    if (taskNameLower === 'electricity-bill') return 'electricity-bill'
    if (taskNameLower === 'title-clearance') return 'title-clearance'
    if (taskNameLower === 'sell-property') return 'sell-property'
    if (taskNameLower === 'khata-transfer') return 'khata-transfer'
    if (taskNameLower === 'auction-day') return 'auction-day'
    if (taskNameLower === 'bank-forms') return 'bank-forms'
    if (taskNameLower === 'submit-emd-to-bank') return 'submit-emd-to-bank'
    
    // Old format mappings (space-separated to kebab-case)
    if (taskNameLower === 'collect requirement') return 'collect-requirement'
    if (taskNameLower === 'share property') return 'share-property'  // New mapping
    if (taskNameLower === 'follow up') return 'follow-up'  // New mapping
    if (taskNameLower === 'lead registration') return 'lead-registration'
    if (taskNameLower === 'site visit') return 'plan-site-visit'
    if (taskNameLower === 'shortlisted property') return 'shortlist-property'  // New mapping
    if (taskNameLower === 'update property') return 'update-property'  // New mapping
    if (taskNameLower === 'eoi collection') return 'collect-eoi'
    if (taskNameLower === 'call') return 'call'  // New mapping
    
    // If no mapping found, convert to kebab-case
    return oldTaskName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export { mapTaskName };