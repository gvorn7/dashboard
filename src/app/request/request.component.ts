import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';


interface ToolDetail {
  No: number;
  PartNo: string;
  ItemNo: string;
  MC: string;
  Process: string;
  Spec: string;
  Usage_pcs: number;
  Qty: number;
  Result1: string;
  Result2: string;
  Result3: string
  Result4: string;
  Result5: string;
  Result6: string;
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent implements OnInit {
  requestForm: FormGroup;
  partNoSuggestions: string[] = [];
  processOptions: string[] = [];
  MCOptions: string[] = [];
  dataSource = new MatTableDataSource<ToolDetail>();
  displayedColumns: string[] = [
    'select',
    'No',
    'PartNo',
    'ItemNo',
    'MC',
    'Process',
    'Spec',
    'Usage_pcs',
    'Qty',
    'Result1',
    'Result2',
    'Result3',
    'Result4',
    'Result5',
    'Result6',
  ];
  selection = new SelectionModel<ToolDetail>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedDivision: string;
  selectedCase: string;

  divisions = [
    { division: '---', viewDivision: '---' },
    { division: 'GM', viewDivision: 'GM' },
    { division: 'PMA', viewDivision: 'PMA' },
  ];
  Cases = [
    { Case: '---', viewCase: '---' },
    { Case: 'BRO', viewCase: 'BRO' },
    { Case: 'BUR', viewCase: 'BUR' },
    { Case: 'USA', viewCase: 'USA' },
    { Case: 'HOL', viewCase: 'HOL' },
    { Case: 'INV', viewCase: 'INV' },
    { Case: 'MOD', viewCase: 'MOD' },
    { Case: 'NON', viewCase: 'NON' },
    { Case: 'RET', viewCase: 'RET' },
    { Case: 'SET', viewCase: 'SET' },
    { Case: 'SPA', viewCase: 'SPA' },
    { Case: 'STO', viewCase: 'STO' },
    { Case: 'CHA', viewCase: 'CHA' },
  ];


  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.selectedDivision = this.divisions[0].division;
    this.selectedCase = this.Cases[0].Case;

    this.requestForm = this.formBuilder.group({
      PartNo: [''],
      Process: [''],
      MC: [''],
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    this.dataSource.sort = this.sort;
  }

  getProcess() {
    const PartNo = this.requestForm.get('PartNo')?.value;
    this.authService.Post_Process({ PartNo }).subscribe((processResponse) => {
      if (processResponse.length > 0 && processResponse[0].length > 0) {
        this.processOptions = processResponse[0].map(
          (item: any) => item.Process
        );
      }
    });
  }

  getMC() {
    const PartNo = this.requestForm.get('PartNo')?.value;
    const Process = this.requestForm.get('Process')?.value;

    if (PartNo && Process) {
      this.authService.GetMC({ PartNo, Process }).subscribe(
        (MCResponse) => {
          if (MCResponse.length > 0 && MCResponse[0].length > 0) {
            this.MCOptions = MCResponse[0].map((item: any) => item.MC);
          } else {
            console.error('MC options not found.');
          }
        },
        (MCError) => {
          console.error('Error fetching MC options:', MCError);
        }
      );
    }
  }

  onSubmit() {
    const PartNo = this.requestForm.get('PartNo')?.value;
    const Process = this.requestForm.get('Process')?.value;
    const MC = this.requestForm.get('MC')?.value;

    if (PartNo && Process && MC) {
      const data = { PartNo, Process, MC };
      this.authService.Post_ToolDetial(data).subscribe({
        next: (response) => {
          if (response.length > 0 && response[0].length > 0) {
            this.dataSource.data = response[0] as ToolDetail[];
          }
        },
      });
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: ToolDetail): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.No + 1}`;
  }
}
