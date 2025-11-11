import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../utils/test-utils';
import { DataTable } from '@/components/scorpion/DataTable';
import { mockTableData } from '../utils/mock-data';
import userEvent from '@testing-library/user-event';

describe('DataTable', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description', wrap: false },
  ];

  it('renders columns and data correctly', () => {
    render(<DataTable columns={columns} data={mockTableData} />);

    // Check column headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('expands and collapses rows on click', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={mockTableData} />);

    const firstRow = screen.getByText('Item 1').closest('tr');
    expect(firstRow).toBeInTheDocument();

    // Click to expand
    await user.click(firstRow!);
    
    // Check expanded content is visible
    expect(screen.getByText(/ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Name:/)).toBeInTheDocument();

    // Click again to collapse
    await user.click(firstRow!);
    
    // Expanded content should be gone
    expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
  });

  it('handles empty data state', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('truncates long content appropriately', () => {
    const longData = [
      {
        id: '1',
        name: 'Short',
        status: 'active',
        description: 'This is a very long description that should be truncated when not expanded because it exceeds the typical display length',
      },
    ];

    render(<DataTable columns={columns} data={longData} />);

    const descriptionCell = screen.getByText(/This is a very long description/).closest('td');
    expect(descriptionCell).toHaveClass('truncate');
  });

  it('displays expanded row details', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={mockTableData} />);

    const firstRow = screen.getByText('Item 1').closest('tr');
    await user.click(firstRow!);

    // Check all column details are shown in expanded view
    expect(screen.getByText(/ID:/)).toBeInTheDocument();
    expect(screen.getByText(/Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Description:/)).toBeInTheDocument();
  });

  it('handles multiple expanded rows', async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={mockTableData} />);

    const rows = screen.getAllByRole('row').filter(row => 
      row.querySelector('td') && !row.querySelector('th')
    );

    // Expand first row
    await user.click(rows[0]);
    expect(screen.getAllByText(/ID:/).length).toBeGreaterThan(0);

    // Expand second row
    await user.click(rows[1]);
    // Should have multiple expanded rows
    const expandedDetails = screen.getAllByText(/ID:/);
    expect(expandedDetails.length).toBeGreaterThan(1);
  });
});

