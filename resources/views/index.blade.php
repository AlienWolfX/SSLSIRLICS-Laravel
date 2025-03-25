<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSLSIRLICS</title>
    <link rel="icon" href="{{ asset ('rsc/icons/favicon.ico')}}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="{{ asset ('rsc/leaflet/leaflet.css')}}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
    <script src="{{ asset ('rsc/leaflet/leaflet.js')}}"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="{{ asset ("rsc/css/index.css")}}" />
    <link rel="stylesheet" href="{{ asset ("rsc/css/details.css")}}" />
  </head>
  <body>
    {{-- <div class="loading-overlay">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div> --}}
    <nav
      class="navbar navbar-light"
      id="navbar"
      style="z-index: 1050; width: 40%; border-radius: 30px">
      <div class="container-fluid">
        <form
          class="d-flex"
          id="search"
          role="search"
          style="
            visibility: visible;
            opacity: 1;
            display: flex !important;
            position: relative;
            width: 100%;
          "></form>
            @if (Route::has('login'))
            <div class="d-flex gap-2">
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn btn-primary btn-sm shadow-sm hover-grow">
                        <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn btn-info btn-sm text-white shadow-sm hover-grow">
                        <i class="fas fa-sign-in-alt me-1"></i>Log in
                    </a>

                    @if (Route::has('register'))
                        <a href="{{ route('register') }}" class="btn btn-success btn-sm shadow-sm hover-grow">
                            <i class="fas fa-user-plus me-1"></i>Register
                        </a>
                    @endif
                @endauth
            </div>
            @endif
      </div>
    </nav>
    <div id="map"></div>

    <div class="modal fade" id="streetlightModal" tabindex="-1" aria-labelledby="streetlightModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-gradient py-2">
            <h5 class="modal-title" id="streetlightModalLabel">
              <i class="fas fa-lightbulb me-2"></i>Streetlight Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3">
            <div class="row g-3">
              <!-- Left Side - Metric Cards -->
              <div class="col-lg-4">
                <div class="sticky-top" style="top: 20px">
                  <div class="fw-bold fs-4 mb-3 text-center">
                    <span id="modal-barangay-text">-</span>
                  </div>
                  <!-- Solar Panel Card -->
                  <div class="card shadow-sm mb-4 hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-solar-panel me-2 solar-icon"></i>Solar Panel
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-bolt metric-icon solar-icon"></i>
                          <div class="metric-value">
                            <span id="modal-solv">-</span> V
                          </div>
                          <div class="metric-label">Voltage</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-charging-station metric-icon solar-icon"></i>
                          <div class="metric-value">
                            <span id="modal-solc">-</span> A
                          </div>
                          <div class="metric-label">Current</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Status Card -->
                  <div class="card shadow-sm mb-4 hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-info-circle me-2 status-icon"></i>Status
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-clock metric-icon status-icon"></i>
                          <div class="metric-value">
                            <span id="modal-last-update">-</span>
                          </div>
                          <div class="metric-label">Last Updated</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-power-off metric-icon status-icon"></i>
                          <div class="metric-value">
                            <span id="modal-status-badge" class="badge bg-secondary">-</span>
                          </div>
                          <div class="metric-label">Current Status</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Load Card -->
                  <div class="card shadow-sm hover-lift">
                    <div class="card-header bg-gradient">
                      <h5 class="mb-0">
                        <i class="fas fa-lightbulb me-2 load-icon"></i>Load
                      </h5>
                    </div>
                    <div class="card-body text-center">
                      <div class="row">
                        <div class="col-6">
                          <i class="fas fa-bolt metric-icon load-icon"></i>
                          <div class="metric-value">
                            <span id="modal-bulbv">-</span> V
                          </div>
                          <div class="metric-label">Voltage</div>
                        </div>
                        <div class="col-6">
                          <i class="fas fa-charging-station metric-icon load-icon"></i>
                          <div class="metric-value">
                            <span id="modal-curv">-</span> A
                          </div>
                          <div class="metric-label">Current</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Battery & Charging History -->
              <div class="col-lg-8">
                <div class="card shadow hover-lift h-100">
                  <div class="card-header bg-gradient">
                    <h5 class="mb-0">
                      <i class="fas fa-battery-three-quarters me-2 battery-icon"></i>
                      Battery & Charging History
                    </h5>
                  </div>
                  <div class="card-body p-4">
                    <!-- Battery Info Section -->
                    <div class="row mb-4">
                      <div class="col-md-4">
                        <div class="battery-status-main p-4 rounded bg-light h-100">
                          <i class="fas fa-battery-three-quarters battery-icon" style="font-size: 3rem"></i>
                          <div class="display-4 mt-2">
                            <span id="modal-batsoc">-</span>%
                          </div>
                          <div class="text-muted">State of Charge</div>
                        </div>
                      </div>
                      <div class="col-md-8">
                        <div class="row h-100">
                          <div class="col-md-6">
                            <div class="battery-status-main p-4 rounded bg-light h-100">
                              <i class="fas fa-bolt battery-icon" style="font-size: 3rem"></i>
                              <div class="display-5 mt-2">
                                <span id="modal-batv">-</span> V
                              </div>
                              <div class="text-muted">Battery Voltage</div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="battery-status-main p-4 rounded bg-light h-100">
                              <i class="fas fa-charging-station battery-icon" style="font-size: 3rem"></i>
                              <div class="display-5 mt-2">
                                <span id="modal-batc">-</span> A
                              </div>
                              <div class="text-muted">Charging Current</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Chart Section -->
                    <div class="chart-section">
                      <div class="chart-container" style="height: 400px">
                        <div id="modal-charging-chart"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script src="{{ asset ('rsc/js/config.js')}}"></script>
    <script src="{{ asset ('rsc/js/apiService.js')}}"></script>
    <script src="{{ asset ('rsc/js/map.js')}}"></script>
    <script src="{{ asset ('rsc/bootstrap/apexcharts/apexcharts.js')}}"></script>
    <script src="{{ asset ('rsc/bootstrap/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
    <script src="{{ asset ('rsc/js/localforage.min.js')}}"></script>

    <script>
      let streetlightMap;
      document.addEventListener("DOMContentLoaded", async () => {
        if (!streetlightMap) {
          streetlightMap = new StreetlightMap();
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (streetlightMap.map) {
            streetlightMap.map.invalidateSize();
          }
        }
      });
    </script>
  </body>
</html>
