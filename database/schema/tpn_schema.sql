-- ==============================================================================
-- MS SQL Server Database Schema for TPN System
-- Run this script to create the required tables for the TPN Application.
-- ==============================================================================

-- 1. Create TPN Orders Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblTpnOrders')
BEGIN
    CREATE TABLE tblTpnOrders (
        tpn_order_id INT IDENTITY(1,1) PRIMARY KEY,
        order_no VARCHAR(30) NULL,
        status VARCHAR(30) NULL,
        temporary_request BIT NULL,
        
        -- Patient Information
        last_name NVARCHAR(200) NULL,
        first_name NVARCHAR(200) NULL,
        middle_name NVARCHAR(200) NULL,
        suffix NVARCHAR(60) NULL,
        hospital_number NVARCHAR(100) NULL,
        date_of_birth DATE NULL,
        sex NVARCHAR(40) NULL,
        ward NVARCHAR(200) NULL,
        room NVARCHAR(200) NULL,
        
        -- Clinical Details
        prescribing_physician NVARCHAR(300) NULL,
        is_initial_order BIT NULL,
        birth_weight_kg DECIMAL(10,3) NULL,
        current_weight_kg DECIMAL(10,3) NULL,
        diagnosis NVARCHAR(MAX) NULL,
        
        -- TPN Requirements
        total_fluid_req_ml_kg_day DECIMAL(10,2) NULL,
        total_fluid_ml DECIMAL(10,2) NULL,
        total_fluid_with_overfill_ml DECIMAL(10,2) NULL,
        duration_hours DECIMAL(10,2) NULL,
        route NVARCHAR(200) NULL,
        
        -- Audit Trail
        created_by VARCHAR(50) NULL,
        modified_by VARCHAR(50) NULL,
        date_created DATETIME2(7) NULL DEFAULT GETDATE(),
        date_modified DATETIME2(7) NULL DEFAULT GETDATE()
    );
END
GO

-- 2. Create TPN Order Computations Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblTpnOrderComputations')
BEGIN
    CREATE TABLE tblTpnOrderComputations (
        computation_id INT IDENTITY(1,1) PRIMARY KEY,
        tpn_order_id INT NULL,
        
        -- Macronutrients
        protein_g_per_kg_day DECIMAL(10,2) NULL,
        dextrose_percent DECIMAL(10,2) NULL,
        lipid_g_per_kg_day DECIMAL(10,2) NULL,
        lipid_concentration DECIMAL(10,2) NULL,
        lipid_duration_hours DECIMAL(10,2) NULL,
        lipid_piggyback BIT NULL,
        lipid_separate_line BIT NULL,
        
        -- Micronutrients & Additives
        sodium_meq_kg_day DECIMAL(10,2) NULL,
        potassium_meq_kg_day DECIMAL(10,2) NULL,
        calcium_mg_kg_day DECIMAL(10,2) NULL,
        magnesium_meq_kg_day DECIMAL(10,2) NULL,
        phosphorus_mmol_kg_day DECIMAL(10,2) NULL,
        trace_elements_ml_kg_day DECIMAL(10,2) NULL,
        multivitamins_ml_day DECIMAL(10,2) NULL,
        
        -- Heparin & Sterile Water
        heparin_ml DECIMAL(10,2) NULL,
        heparin_units_per_ml DECIMAL(10,2) NULL,
        heparin_iu_per_ml DECIMAL(8,2) NULL,
        
        -- Osmolarity
        use_osmolarity_calculator BIT NOT NULL DEFAULT 0,
        osmolarity_inputs_json NVARCHAR(MAX) NULL,
        osmolarity_computed_mosm_l DECIMAL(10,2) NULL,
        osmolarity_notes NVARCHAR(MAX) NULL,
        
        -- Audit Trail
        created_by VARCHAR(50) NULL,
        modified_by VARCHAR(50) NULL,
        date_created DATETIME2(7) NULL DEFAULT GETDATE(),
        date_modified DATETIME2(7) NULL DEFAULT GETDATE(),
        
        -- Constraints
        CONSTRAINT FK_TpnOrderComputations_TpnOrders FOREIGN KEY (tpn_order_id)
        REFERENCES tblTpnOrders(tpn_order_id)
        ON DELETE CASCADE
    );
END
GO

-- 3. Create TPN Order Status History Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblTpnOrderStatusHistory')
BEGIN
    CREATE TABLE tblTpnOrderStatusHistory (
        history_id INT IDENTITY(1,1) PRIMARY KEY,
        tpn_order_id INT NULL,
        old_status VARCHAR(30) NULL,
        new_status VARCHAR(30) NULL,
        remarks NVARCHAR(MAX) NULL,
        
        -- Audit Trail
        changed_by VARCHAR(50) NULL,
        changed_at DATETIME2(7) NULL DEFAULT GETDATE(),
        
        -- Constraints
        CONSTRAINT FK_TpnOrderStatusHistory_TpnOrders FOREIGN KEY (tpn_order_id)
        REFERENCES tblTpnOrders(tpn_order_id)
        ON DELETE CASCADE
    );
END
GO

-- 4. Create TPN Order Sequence Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tblTpnOrderSequence')
BEGIN
    CREATE TABLE tblTpnOrderSequence (
        seq_year INT NULL,
        last_number INT NULL,
        created_by VARCHAR(50) NULL,
        modified_by VARCHAR(50) NULL,
        created_at DATETIME2(7) NULL DEFAULT GETDATE(),
        updated_at DATETIME2(7) NULL DEFAULT GETDATE()
    );
END
GO

-- 5. Create User Authority Table for Authentication
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAuthority')
BEGIN
    CREATE TABLE UserAuthority (
        id INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(255) NULL,
        BiometricID VARCHAR(50) NOT NULL UNIQUE,
        UserPrivilege INT DEFAULT 0,
        Section NVARCHAR(100) NULL,
        Division NVARCHAR(100) NULL,
        Position NVARCHAR(100) NULL,
        SectionName NVARCHAR(255) NULL,
        PositionName NVARCHAR(255) NULL,
        LastLogin DATETIME NULL,
        created_by VARCHAR(50) NULL,
        modified_by VARCHAR(50) NULL,
        created_at DATETIME2(7) NULL DEFAULT GETDATE(),
        updated_at DATETIME2(7) NULL DEFAULT GETDATE()
    );
END
GO

-- ==============================================================================
-- End of Script
-- ==============================================================================
