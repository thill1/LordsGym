import fs from 'fs';

const markdown = fs.readFileSync('CLIENT_UAT_PLAN.md', 'utf-8');

// Parse markdown and convert to HTML form
function convertToHTML(md) {
  const lines = md.split('\n');
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lord's Gym - Phase 1 UAT Plan</title>
    <style>
        @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 20px; }
            .section { page-break-inside: avoid; }
            .sign-off { page-break-before: always; }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: #f5f5f5;
        }
        
        .header {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            margin: -20px -20px 30px -20px;
            text-align: center;
        }
        
        .contact-info {
            background: #2d2d2d;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 5px;
            color: white;
        }
        
        .contact-info p {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .watermark {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: #ccc;
            font-size: 10px;
            opacity: 0.5;
            pointer-events: none;
            z-index: 1000;
        }
        
        h1 {
            color: #333;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #555;
            margin-top: 30px;
            border-left: 4px solid #d4af37;
            padding-left: 10px;
        }
        
        h3 {
            color: #666;
            margin-top: 20px;
        }
        
        .test-item {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-left: 3px solid #e0e0e0;
            border-radius: 3px;
        }
        
        .test-item:hover {
            border-left-color: #d4af37;
        }
        
        .checkbox-group {
            margin: 10px 0;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .checkbox-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .checkbox-item label {
            font-weight: 600;
            cursor: pointer;
            user-select: none;
        }
        
        .approved { color: #28a745; }
        .unapproved { color: #dc3545; }
        .discuss { color: #ffc107; }
        
        .notes {
            margin-top: 10px;
            padding: 10px;
            border: 1px dashed #ccc;
            border-radius: 3px;
            width: 100%;
            min-height: 40px;
            font-family: inherit;
            box-sizing: border-box;
        }
        
        .sign-off {
            background: white;
            padding: 30px;
            margin-top: 40px;
            border: 2px solid #d4af37;
            border-radius: 5px;
        }
        
        .form-field {
            margin: 10px 0;
        }
        
        .form-field label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        
        .form-field input[type="text"],
        .form-field input[type="email"],
        .form-field input[type="tel"],
        .form-field input[type="date"],
        .form-field textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            font-family: inherit;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        .form-field textarea {
            min-height: 80px;
            resize: vertical;
        }
        
        .intro {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .intro ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .button-group {
            text-align: center;
            margin: 30px 0;
        }
        
        button {
            background: #d4af37;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 10px;
        }
        
        button:hover {
            background: #b8941f;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .summary-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 3px;
        }
        
        .summary-item input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            margin-top: 5px;
            box-sizing: border-box;
        }
        
        .approval-status {
            margin: 20px 0;
        }
        
        .approval-status label {
            display: block;
            margin: 10px 0;
            font-size: 16px;
        }
        
        .approval-status input[type="radio"] {
            width: 20px;
            height: 20px;
            margin-right: 10px;
        }
        
        .issues-list textarea {
            min-height: 60px;
            margin-bottom: 10px;
        }
        
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="watermark">Lord's Gym - Phase 1 Project Report | Confidential</div>
    
    <div class="header">
        <h1>Lord's Gym Website - Phase 1 User Acceptance Testing Plan</h1>
    </div>
    
    <div class="contact-info">
        <p><strong>Project Manager:</strong> Troy Hill</p>
        <p><strong>Company:</strong> Sentient Partners</p>
        <p><strong>Phone:</strong> 415-504-2757</p>
    </div>
    
    <div class="intro">
        <h2>Introduction</h2>
        <p>This User Acceptance Testing (UAT) plan is designed for you to review and approve all Phase 1 functionalities and the general appearance of the Lord's Gym website. Please test each item below and mark your approval status using the checkboxes provided.</p>
        
        <h3>How to Use This Document:</h3>
        <ul>
            <li>Test each item on the website</li>
            <li>Mark one checkbox per item: <strong>Approved</strong>, <strong>Unapproved</strong>, or <strong>Discuss</strong></li>
            <li>Add notes in the provided spaces if needed</li>
            <li>Complete the sign-off page at the end</li>
            <li>Click "Print / Save as PDF" when finished</li>
            <li>Email the completed PDF back</li>
        </ul>
    </div>
    
    <div class="no-print button-group">
        <button onclick="window.print()">Print / Save as PDF</button>
        <button onclick="clearAll()">Clear All Checkboxes</button>
    </div>
    
    <div class="content">`;

  let inTestItem = false;
  let currentSection = '';
  let testItemCount = 0;
  let currentTestItem = { title: '', items: [], notes: false };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and horizontal rules
    if (!line || line === '---') continue;
    
    // Handle main headings (##)
    if (line.startsWith('## ') && !line.startsWith('###')) {
      const heading = line.replace('## ', '');
      if (heading === 'Contact Information' || heading === 'Introduction' || heading === 'Contact for Questions') {
        continue; // Skip these as they're handled separately
      }
      if (heading.includes('Sign-Off')) {
        html += '</div>'; // Close content div
        html += generateSignOffSection();
        break;
      }
      html += `</div><div class="section"><h2>${heading}</h2>`;
      currentSection = heading;
      continue;
    }
    
    // Handle subheadings (###) - these are test items
    if (line.startsWith('### ')) {
      // Save previous test item if exists
      if (currentTestItem.title) {
        html += generateTestItemHTML(currentTestItem, testItemCount);
        testItemCount++;
      }
      
      currentTestItem = {
        title: line.replace('### ', ''),
        items: [],
        notes: false
      };
      continue;
    }
    
    // Handle checkbox lines
    if (line.includes('[ ] **Approved**')) {
      currentTestItem.hasCheckboxes = true;
      continue;
    }
    
    // Handle list items
    if (line.startsWith('- ') && !line.includes('**Approved**') && !line.includes('**Unapproved**') && !line.includes('**Discuss**')) {
      const content = line.replace(/^-\s+/, '').replace(/\*\*/g, '');
      if (content.includes('Notes:')) {
        currentTestItem.notes = true;
      } else {
        currentTestItem.items.push(content);
      }
      continue;
    }
    
    // Handle notes line
    if (line.includes('Notes:') || line.includes('_________________________________')) {
      currentTestItem.notes = true;
      continue;
    }
  }
  
  // Add last test item
  if (currentTestItem.title) {
    html += generateTestItemHTML(currentTestItem, testItemCount);
  }
  
  html += `</div>
    
    <script>
        // Ensure only one checkbox per group is selected
        document.querySelectorAll('.checkbox-group').forEach(group => {
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        checkboxes.forEach(cb => {
                            if (cb !== this) cb.checked = false;
                        });
                    }
                });
            });
        });
        
        function clearAll() {
            if (confirm('Are you sure you want to clear all checkboxes?')) {
                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('textarea').forEach(ta => ta.value = '');
                document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]').forEach(inp => inp.value = '');
                document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            }
        }
    </script>
</body>
</html>`;

  return html;
}

function generateTestItemHTML(item, index) {
  const id = `test_${index}`;
  let html = `<div class="test-item">
        <h3>${item.title}</h3>
        <div class="checkbox-group">
            <div class="checkbox-item">
                <input type="checkbox" name="${id}_approved" id="${id}_approved">
                <label for="${id}_approved" class="approved">Approved</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" name="${id}_unapproved" id="${id}_unapproved">
                <label for="${id}_unapproved" class="unapproved">Unapproved</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" name="${id}_discuss" id="${id}_discuss">
                <label for="${id}_discuss" class="discuss">Discuss</label>
            </div>
        </div>`;
  
  if (item.items.length > 0) {
    html += '<ul>';
    item.items.forEach(itemText => {
      html += `<li>${itemText}</li>`;
    });
    html += '</ul>';
  }
  
  html += `<textarea class="notes" name="${id}_notes" placeholder="Notes..."></textarea>
    </div>`;
  
  return html;
}

function generateSignOffSection() {
  return `
    <div class="sign-off">
        <h2>13. Sign-Off & Approval</h2>
        
        <div class="form-field">
            <label>Tester Name: *</label>
            <input type="text" name="tester_name" required>
        </div>
        
        <div class="form-field">
            <label>Title/Role:</label>
            <input type="text" name="tester_title">
        </div>
        
        <div class="form-field">
            <label>Company:</label>
            <input type="text" name="tester_company">
        </div>
        
        <div class="form-field">
            <label>Date of Testing: *</label>
            <input type="date" name="test_date" required>
        </div>
        
        <div class="form-field">
            <label>Email:</label>
            <input type="email" name="tester_email">
        </div>
        
        <div class="form-field">
            <label>Phone:</label>
            <input type="tel" name="tester_phone">
        </div>
        
        <div class="summary-grid">
            <div class="summary-item">
                <label>Total Items Tested:</label>
                <input type="text" name="total_tested">
            </div>
            <div class="summary-item">
                <label>Items Approved:</label>
                <input type="text" name="total_approved">
            </div>
            <div class="summary-item">
                <label>Items Unapproved:</label>
                <input type="text" name="total_unapproved">
            </div>
            <div class="summary-item">
                <label>Items Requiring Discussion:</label>
                <input type="text" name="total_discuss">
            </div>
        </div>
        
        <div class="approval-status">
            <h3>Overall Approval Status</h3>
            <label>
                <input type="radio" name="approval_status" value="approved">
                APPROVED - Website is ready for launch as-is
            </label>
            <label>
                <input type="radio" name="approval_status" value="approved_minor">
                APPROVED WITH MINOR ISSUES - Website is approved but minor issues should be addressed post-launch
            </label>
            <label>
                <input type="radio" name="approval_status" value="conditional">
                CONDITIONAL APPROVAL - Website approved pending resolution of specific issues
            </label>
            <label>
                <input type="radio" name="approval_status" value="not_approved">
                NOT APPROVED - Major issues must be resolved before approval
            </label>
        </div>
        
        <div class="form-field">
            <label>Critical Issues:</label>
            <textarea name="critical_issues" placeholder="List critical issues here..."></textarea>
        </div>
        
        <div class="form-field">
            <label>Important Issues:</label>
            <textarea name="important_issues" placeholder="List important issues here..."></textarea>
        </div>
        
        <div class="form-field">
            <label>Minor Issues:</label>
            <textarea name="minor_issues" placeholder="List minor issues here..."></textarea>
        </div>
        
        <div class="form-field">
            <label>Additional Comments:</label>
            <textarea name="additional_comments" placeholder="Any additional comments..."></textarea>
        </div>
        
        <div class="form-field">
            <label>Signature: *</label>
            <input type="text" name="signature" required>
        </div>
        
        <div class="form-field">
            <label>Date: *</label>
            <input type="date" name="signature_date" required>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
            <h3>Contact for Questions</h3>
            <p><strong>Troy Hill</strong><br>
            Sentient Partners<br>
            Phone: 415-504-2757</p>
        </div>
    </div>`;
}

const html = convertToHTML(markdown);
fs.writeFileSync('CLIENT_UAT_PLAN.html', html);
console.log('✓ HTML form generated: CLIENT_UAT_PLAN.html');
console.log('\nTo use:');
console.log('1. Open CLIENT_UAT_PLAN.html in a web browser');
console.log('2. Fill out the form');
console.log('3. Click "Print / Save as PDF"');
console.log('4. Save the PDF and email it back');
