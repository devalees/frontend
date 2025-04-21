/**
 * ComplianceReportForm Component
 * 
 * Form for generating compliance reports from audit logs.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Switch } from '../../ui/Switch';
import { Label } from '../../ui/Label';
import { FileText, Download } from 'lucide-react';

interface ComplianceReportFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const ComplianceReportForm: React.FC<ComplianceReportFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [format, setFormat] = useState('PDF');
  const [includeDeleted, setIncludeDeleted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        startDate,
        endDate,
        includeDeleted,
        format
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="compliance-report-form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Compliance Report
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Report Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="XLSX">Excel</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="include-deleted" 
                checked={includeDeleted} 
                onCheckedChange={setIncludeDeleted}
              />
              <Label htmlFor="include-deleted">Include deleted records</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="tertiary"
              onClick={onCancel}
              disabled={isSubmitting}
              data-testid="cancel-report-btn"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
              data-testid="generate-report-btn"
            >
              {isSubmitting ? (
                'Generating...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}; 