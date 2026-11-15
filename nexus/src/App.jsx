import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="app-container" id="appContainer">
        <aside className="sidebar">
            <div>
                <div className="sidebar-logo">
                    <div className="logo-inner">
                        <div className="logo-badge">N</div>
                        <div className="logo-text-group">
                            <span className="logo-title">NEXUS</span>
                        </div>
                    </div>
                    <button className="sidebar-toggle-btn" id="sidebarToggle"
                        aria-label="Recolher menu" aria-expanded="true" title="Recolher/expandir menu">☰</button>
                </div>

                <div className="workspace-selector-box">
                    <span className="sidebar-section-title">CONTA ATIVA</span>
                    <div className="account-selector-sidebar">
                        <span className="acc-badge">AW</span>
                        <div className="acc-text">
                            <span className="acc-name">Aurora Wealth</span>
                            <span className="acc-type">Conta empresarial ⌄</span>
                        </div>
                    </div>
                </div>

                <span className="sidebar-section-title">NAVEGAÇÃO</span>
                <nav className="sidebar-nav">
                    <a href="geral.html" className="nav-item active" title="Visão geral">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                        <span>Visão geral</span>
                    </a>
                    <a href="clientes.html" className="nav-item" title="Clientes">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span>Clientes</span>
                    </a>
                    <a href="carteiras.html" className="nav-item" title="Carteiras">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
                        <span>Carteiras</span>
                    </a>
                    <a href="movimentacoes.html" className="nav-item" title="Movimentações">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                        <span>Movimentações</span>
                    </a>
                    <a href="investimentos.html" className="nav-item" title="Investimentos">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                        <span>Investimentos</span>
                    </a>
                    <a href="relatorios.html" className="nav-item" title="Relatórios">
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-6"/><path d="M16 18v-4"/></svg>
                        <span>Relatórios</span>
                    </a>
                </nav>
            </div>

            <div>
                <div className="sidebar-footer-card">
                    <div className="plan-info">
                        <span className="plan-name">Plano Pro</span>
                        <span className="badge-ativo">ATIVO</span>
                    </div>
                    <p className="plan-desc">8 de 12 carteiras acompanhadas</p>
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>
        </aside>

        <main className="main-content">
            <header className="dashboard-topbar">
                <div className="breadcrumb">
                    <span>Investimentos</span> / <span className="current-crumb">Visão geral</span>
                </div>
                <div className="topbar-actions">
                    <button className="icon-btn" title="Ajuda">
                        <img src="Icones/duvida.png" alt="Ajuda" className="icon-help"/>
                    </button>
                    <button className="icon-btn" title="Notificações">
                        <img src="Icones/bell.svg" alt="Notificação" className="bell-icon"/>
                    </button>

                    <div className="user-profile-topbar">
                        <div className="user-avatar-circle">MC</div>
                        <div className="user-info-text">
                            <span className="user-name">Marina Costa</span>
                            <span className="user-role">Assessora sênior</span>
                        </div>
                        <span className="settings-dots" title="Sair">
                            <img src="Icones/trespontinhos.png" alt="Sair" className="icon-dots"/>
                        </span>
                    </div>
                </div>
            </header>

            <div className="content-wrapper">
                <div className="page-title-row">
                    <div>
                        <h1>Visão geral</h1>
                        <p className="section-desc">Acompanhe a saúde e a rentabilidade consolidada dos investimentos.</p>
                    </div>
                    <div className="filter-export-group">
                        <div className="date-filter">
                            <span>📅 01–30 set 2026</span>
                        </div>
                        <button id="btnExportar" className="btn-pink-solid">
                            <span>⬇</span> Exportar
                        </button>
                    </div>
                </div>

                <div className="metrics-cards-grid">
                    <div className="metric-card-dark">
                        <div className="metric-card-header">
                            <span className="card-label-light">Total investido</span>
                            <span className="card-icon-bg pink"><img src="Icones/wallet.png" alt=""/></span>
                        </div>
                        <h2 className="metric-value-white">R$ 4,28 mi</h2>
                        <div className="metric-footer-badge">
                            <span className="badge-green">↗ 8,4%</span> <span className="sub-text-muted">vs. mês anterior</span>
                        </div>
                    </div>

                    <div className="metric-card-light">
                        <div className="metric-card-header">
                            <span className="card-label-dark">Custos operacionais</span>
                            <span className="card-icon-bg cream"><img src="Icones/Vector.png" alt=""/></span>
                        </div>
                        <h2 className="metric-value-dark">R$ 124,6 mil</h2>
                        <div className="metric-footer-badge">
                            <span className="badge-green">↗ 2,1%</span> <span className="sub-text-dark">economia no período</span>
                        </div>
                    </div>

                    <div className="metric-card-light">
                        <div className="metric-card-header">
                            <span className="card-label-dark">Lucro geral</span>
                            <span className="card-icon-bg cream"><img src="Icones/badge-dollar-sign.png" alt=""/></span>
                        </div>
                        <h2 className="metric-value-dark">R$ 618,9 mil</h2>
                        <div className="metric-footer-badge">
                            <span className="badge-green">↗ 12,6%</span> <span className="sub-text-dark">resultado líquido</span>
                        </div>
                    </div>

                    <div className="metric-card-light">
                        <div className="metric-card-header">
                            <span className="card-label-dark">ROI</span>
                            <span className="card-icon-bg cream"><img src="Icones/target.png" alt=""/></span>
                        </div>
                        <h2 className="metric-value-dark">14,46%</h2>
                        <div className="metric-footer-badge">
                            <span className="badge-green">↗ 1,8 p.p.</span> <span className="sub-text-dark">acima da meta</span>
                        </div>
                    </div>
                </div>

                <div className="charts-row v2">
                    <div className="chart-box-main">
                        <div className="chart-header-row">
                            <div>
                                <h3>Lucro acumulado</h3>
                                <span className="sub-text-dark"><span className="legend-dot"></span>Resultado líquido mensal</span>
                            </div>
                            <div className="date-filter small">
                                <span>Últimos 7 meses</span>
                                <span className="arrow-down">⌄</span>
                            </div>
                        </div>
                        <div className="bar-chart-visual" role="img"
                            aria-label="Lucro líquido mensal de março a setembro; setembro é o maior, R$ 96 mil">
                            <div className="bar-col">
                                <div className="bar"><span>Mar</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar"><span>Abr</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar"><span>Mai</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar"><span>Jun</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar"><span>Jul</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar"><span>Ago</span></div>
                            </div>
                            <div className="bar-col">
                                <div className="bar highlight"><span className="bar-tooltip">R$ 96k</span><span>Set</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="allocation-box">
                        <div className="chart-header-row">
                            <div>
                                <h3>Alocação</h3>
                                <span className="sub-text-dark">Distribuição por className</span>
                            </div>
                            <span className="dots-menu" title="Mais opções">
                                <img src="Icones/trespontinhos.png" alt="Mais opções" className="icon-dots"/>
                            </span>
                        </div>
                        <div className="donut-container">
                            <div className="donut-ring" role="img"
                                aria-label="Renda fixa 48%, Fundos 26%, Ações 18%, Caixa 8%">
                                <span className="donut-center-text"><b>100%</b><small>alocado</small></span>
                            </div>
                            <div className="donut-legend">
                                <div className="legend-item"><span className="dot rf"></span> Renda fixa <span className="val">48%</span></div>
                                <div className="legend-item"><span className="dot fu"></span> Fundos <span className="val">26%</span></div>
                                <div className="legend-item"><span className="dot ac"></span> Ações <span className="val">18%</span></div>
                                <div className="legend-item"><span className="dot cx"></span> Caixa <span className="val">8%</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="positions-table-box v2">
                    <div className="table-header-row">
                        <div>
                            <h3>Principais posições</h3>
                            <span className="sub-text-dark">Ativos com maior participação na carteira</span>
                        </div>
                        <a href="carteiras.html" className="pink-link-arrow">Ver carteira completa ↗</a>
                    </div>
                    <div className="table-responsive">
                        <table className="positions-table">
                            <thead>
                                <tr>
                                    <th>ATIVO</th>
                                    <th>CATEGORIA</th>
                                    <th>VALOR APLICADO</th>
                                    <th className="col-right">RENTABILIDADE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="asset-cell"><span className="asset-icon t-pink"><svg viewBox="0 0 24 24"
                                                    width="18" height="18" fill="none" stroke="currentColor"
                                                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                                    aria-hidden="true">
                                                    <line x1="3" x2="21" y1="22" y2="22" />
                                                    <line x1="6" x2="6" y1="18" y2="11" />
                                                    <line x1="10" x2="10" y1="18" y2="11" />
                                                    <line x1="14" x2="14" y1="18" y2="11" />
                                                    <line x1="18" x2="18" y1="18" y2="11" />
                                                    <polygon points="12 2 20 7 4 7" />
                                                </svg></span>Tesouro IPCA+ 2035</div>
                                    </td>
                                    <td>Renda fixa</td>
                                    <td>R$ 840.200</td>
                                    <td className="col-right"><span className="rent-positive">↗ +8,42%</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="asset-cell"><span className="asset-icon t-lilac"><svg
                                                    viewBox="0 0 24 24" width="18" height="18" fill="none"
                                                    stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                                    stroke-linejoin="round" aria-hidden="true">
                                                    <path
                                                        d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                                                    <path
                                                        d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                                                    <path
                                                        d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                                                </svg></span>Fundo Aurora Macro</div>
                                    </td>
                                    <td>Fundos</td>
                                    <td>R$ 524.900</td>
                                    <td className="col-right"><span className="rent-positive">↗ +12,18%</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="asset-cell"><span className="asset-icon t-peach"><svg
                                                    viewBox="0 0 24 24" width="18" height="18" fill="none"
                                                    stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                                    stroke-linejoin="round" aria-hidden="true">
                                                    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                                                    <path d="M18 17V9" />
                                                    <path d="M13 17V5" />
                                                    <path d="M8 17v-3" />
                                                </svg></span>PETR4</div>
                                    </td>
                                    <td>Ações</td>
                                    <td>R$ 318.400</td>
                                    <td className="col-right"><span className="rent-positive">↗ +4,76%</span></td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="asset-cell"><span className="asset-icon t-mint"><svg viewBox="0 0 24 24"
                                                    width="18" height="18" fill="none" stroke="currentColor"
                                                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                                    aria-hidden="true">
                                                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                                                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                                                    <path d="M10 6h4" />
                                                    <path d="M10 10h4" />
                                                    <path d="M10 14h4" />
                                                    <path d="M10 18h4" />
                                                </svg></span>CDB Banco Prisma</div>
                                    </td>
                                    <td>Renda fixa</td>
                                    <td>R$ 286.000</td>
                                    <td className="col-right"><span className="rent-positive">↗ +6,91%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>



    </>
  )
}

export default App
